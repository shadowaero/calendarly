import { Router } from 'express';
import db from '../db.js';
import { getWeekNumber } from './events.js';
import { broadcast } from '../websocket.js';

const router = Router();

// ----------------------------------------------------
// MEMBERS CRUD
// ----------------------------------------------------
router.get('/members', (req, res) => {
  try {
    const currentWeek = getWeekNumber();
    const members = db.prepare('SELECT * FROM members ORDER BY id ASC').all();

    const enriched = members.map((member) => {
      const weeklyEarned = db.prepare(`
        SELECT COALESCE(SUM(points_awarded), 0) as total 
        FROM chore_logs 
        WHERE member_id = ? AND week_number = ?
      `).get(member.id, currentWeek).total;

      const weeklySpent = db.prepare(`
        SELECT COALESCE(SUM(cost), 0) as total 
        FROM redemptions 
        WHERE member_id = ? AND week_number = ?
      `).get(member.id, currentWeek).total;

      const lifetimeEarned = db.prepare(`
        SELECT COALESCE(SUM(points_awarded), 0) as total 
        FROM chore_logs 
        WHERE member_id = ?
      `).get(member.id).total;

      const lifetimeSpent = db.prepare(`
        SELECT COALESCE(SUM(cost), 0) as total 
        FROM redemptions 
        WHERE member_id = ?
      `).get(member.id).total;

      return {
        ...member,
        weeklyPoints: Math.max(0, weeklyEarned - weeklySpent),
        weeklyEarned,
        weeklySpent,
        totalBalance: Math.max(0, lifetimeEarned - lifetimeSpent)
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/members', (req, res) => {
  try {
    const { name, avatar, color } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    const stmt = db.prepare('INSERT INTO members (name, avatar, color) VALUES (?, ?, ?)');
    const result = stmt.run(name.trim(), avatar || '🧒', color || '#3B82F6');
    const created = db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid);
    broadcast('MEMBER_CREATED', created);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/members/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, avatar, color } = req.body;
    const existing = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Member not found' });

    db.prepare('UPDATE members SET name = ?, avatar = ?, color = ? WHERE id = ?').run(
      name !== undefined ? name.trim() : existing.name,
      avatar !== undefined ? avatar : existing.avatar,
      color !== undefined ? color : existing.color,
      id
    );

    const updated = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    broadcast('MEMBER_UPDATED', updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/members/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM members WHERE id = ?').run(id);
    broadcast('MEMBER_DELETED', { id: Number(id) });
    res.json({ success: true, id: Number(id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// CHORES CRUD
// ----------------------------------------------------
router.get('/chores', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentWeek = getWeekNumber();

    const chores = db.prepare(`
      SELECT c.*, m.name as member_name, m.avatar as member_avatar, m.color as member_color
      FROM chores c
      LEFT JOIN members m ON c.member_id = m.id
      WHERE c.active = 1
      ORDER BY c.member_id ASC, c.id ASC
    `).all();

    const enriched = chores.map((chore) => {
      let isCompleted = false;
      let lastCompletedLog = null;

      if (chore.frequency === 'daily') {
        lastCompletedLog = db.prepare(`
          SELECT * FROM chore_logs 
          WHERE chore_id = ? AND completed_at LIKE ? 
          ORDER BY id DESC LIMIT 1
        `).get(chore.id, `${today}%`);
        isCompleted = !!lastCompletedLog;
      } else {
        lastCompletedLog = db.prepare(`
          SELECT * FROM chore_logs 
          WHERE chore_id = ? AND week_number = ? 
          ORDER BY id DESC LIMIT 1
        `).get(chore.id, currentWeek);
        isCompleted = !!lastCompletedLog;
      }

      return {
        ...chore,
        completedToday: isCompleted,
        lastLog: lastCompletedLog
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/chores', (req, res) => {
  try {
    const { title, description, points, member_id, frequency, icon } = req.body;
    if (!title || !points) return res.status(400).json({ error: 'Title and points are required' });
    const stmt = db.prepare(`
      INSERT INTO chores (title, description, points, member_id, frequency, icon)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(title, description || '', points, member_id || null, frequency || 'daily', icon || '⭐');
    const created = db.prepare('SELECT * FROM chores WHERE id = ?').get(result.lastInsertRowid);
    broadcast('CHORE_CREATED', created);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update / Edit Chore
router.put('/chores/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, points, member_id, frequency, icon } = req.body;
    const existing = db.prepare('SELECT * FROM chores WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Chore not found' });

    db.prepare(`
      UPDATE chores
      SET title = ?, description = ?, points = ?, member_id = ?, frequency = ?, icon = ?
      WHERE id = ?
    `).run(
      title !== undefined ? title : existing.title,
      description !== undefined ? description : existing.description,
      points !== undefined ? Number(points) : existing.points,
      member_id !== undefined ? (member_id ? Number(member_id) : null) : existing.member_id,
      frequency !== undefined ? frequency : existing.frequency,
      icon !== undefined ? icon : existing.icon,
      id
    );

    const updated = db.prepare(`
      SELECT c.*, m.name as member_name, m.avatar as member_avatar, m.color as member_color
      FROM chores c
      LEFT JOIN members m ON c.member_id = m.id
      WHERE c.id = ?
    `).get(id);

    broadcast('CHORE_UPDATED', updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/chores/:id/complete', (req, res) => {
  try {
    const { id } = req.params;
    const chore = db.prepare('SELECT * FROM chores WHERE id = ?').get(id);
    if (!chore) return res.status(404).json({ error: 'Chore not found' });

    const memberId = req.body.member_id || chore.member_id;
    if (!memberId) return res.status(400).json({ error: 'Member ID required to log chore' });

    const today = new Date().toISOString().split('T')[0];
    const currentWeek = getWeekNumber();
    const nowIso = new Date().toISOString();

    let existingLog = null;
    if (chore.frequency === 'daily') {
      existingLog = db.prepare(`
        SELECT * FROM chore_logs 
        WHERE chore_id = ? AND member_id = ? AND completed_at LIKE ?
      `).get(chore.id, memberId, `${today}%`);
    } else {
      existingLog = db.prepare(`
        SELECT * FROM chore_logs 
        WHERE chore_id = ? AND member_id = ? AND week_number = ?
      `).get(chore.id, memberId, currentWeek);
    }

    if (existingLog) {
      db.prepare('DELETE FROM chore_logs WHERE id = ?').run(existingLog.id);
      broadcast('CHORE_UPDATED', { choreId: chore.id, memberId, completed: false, weekNumber: currentWeek });
      return res.json({ success: true, completed: false, action: 'undone' });
    } else {
      const insert = db.prepare(`
        INSERT INTO chore_logs (chore_id, member_id, points_awarded, completed_at, week_number)
        VALUES (?, ?, ?, ?, ?)
      `);
      insert.run(chore.id, memberId, chore.points, nowIso, currentWeek);
      broadcast('CHORE_UPDATED', { choreId: chore.id, memberId, points: chore.points, completed: true, weekNumber: currentWeek });
      return res.json({ success: true, completed: true, pointsAwarded: chore.points, action: 'completed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/chores/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM chores WHERE id = ?').run(id);
    broadcast('CHORE_DELETED', { id: Number(id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// REWARDS STORE CRUD
// ----------------------------------------------------
router.get('/rewards', (req, res) => {
  try {
    const rewards = db.prepare('SELECT * FROM rewards WHERE active = 1 ORDER BY cost ASC').all();
    res.json(rewards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/rewards', (req, res) => {
  try {
    const { title, cost, icon, description } = req.body;
    if (!title || cost === undefined || cost === null) {
      return res.status(400).json({ error: 'Title and cost are required' });
    }
    const stmt = db.prepare('INSERT INTO rewards (title, cost, icon, description) VALUES (?, ?, ?, ?)');
    const result = stmt.run(title, Number(cost), icon || '🎁', description || '');
    const created = db.prepare('SELECT * FROM rewards WHERE id = ?').get(result.lastInsertRowid);
    broadcast('REWARD_CREATED', created);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/rewards/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, cost, icon, description } = req.body;
    const existing = db.prepare('SELECT * FROM rewards WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Reward not found' });

    db.prepare(`
      UPDATE rewards
      SET title = ?, cost = ?, icon = ?, description = ?
      WHERE id = ?
    `).run(
      title !== undefined ? title : existing.title,
      cost !== undefined ? Number(cost) : existing.cost,
      icon !== undefined ? icon : existing.icon,
      description !== undefined ? description : existing.description,
      id
    );

    const updated = db.prepare('SELECT * FROM rewards WHERE id = ?').get(id);
    broadcast('REWARD_UPDATED', updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/rewards/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM rewards WHERE id = ?').run(id);
    broadcast('REWARD_DELETED', { id: Number(id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/rewards/:id/redeem', (req, res) => {
  try {
    const { id } = req.params;
    const { member_id } = req.body;
    if (!member_id) return res.status(400).json({ error: 'Member ID is required' });

    const reward = db.prepare('SELECT * FROM rewards WHERE id = ?').get(id);
    if (!reward) return res.status(404).json({ error: 'Reward not found' });

    const currentWeek = getWeekNumber();
    const weeklyEarned = db.prepare(`
      SELECT COALESCE(SUM(points_awarded), 0) as total 
      FROM chore_logs 
      WHERE member_id = ? AND week_number = ?
    `).get(member_id, currentWeek).total;

    const weeklySpent = db.prepare(`
      SELECT COALESCE(SUM(cost), 0) as total 
      FROM redemptions 
      WHERE member_id = ? AND week_number = ?
    `).get(member_id, currentWeek).total;

    const currentBalance = weeklyEarned - weeklySpent;

    if (currentBalance < reward.cost) {
      return res.status(400).json({
        error: `Insufficient points! You have ${currentBalance} pts, but "${reward.title}" requires ${reward.cost} pts.`
      });
    }

    const insert = db.prepare(`
      INSERT INTO redemptions (reward_id, member_id, cost, redeemed_at, week_number, status)
      VALUES (?, ?, ?, ?, ?, 'approved')
    `);
    const nowIso = new Date().toISOString();
    insert.run(reward.id, member_id, reward.cost, nowIso, currentWeek);

    broadcast('REWARD_REDEEMED', {
      memberId: member_id,
      rewardId: reward.id,
      rewardTitle: reward.title,
      cost: reward.cost,
      newBalance: currentBalance - reward.cost,
      weekNumber: currentWeek
    });

    res.json({
      success: true,
      message: `Redeemed ${reward.title} for ${reward.cost} pts!`,
      remainingBalance: currentBalance - reward.cost
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/activity', (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT 
        cl.id, 
        'chore' as type, 
        cl.completed_at as timestamp, 
        cl.points_awarded as points, 
        c.title as item_title, 
        c.icon as item_icon,
        m.name as member_name, 
        m.avatar as member_avatar,
        m.color as member_color
      FROM chore_logs cl
      JOIN chores c ON cl.chore_id = c.id
      JOIN members m ON cl.member_id = m.id
      UNION ALL
      SELECT 
        r.id, 
        'redemption' as type, 
        r.redeemed_at as timestamp, 
        -r.cost as points, 
        rw.title as item_title, 
        rw.icon as item_icon,
        m.name as member_name, 
        m.avatar as member_avatar,
        m.color as member_color
      FROM redemptions r
      JOIN rewards rw ON r.reward_id = rw.id
      JOIN members m ON r.member_id = m.id
      ORDER BY timestamp DESC
      LIMIT 25
    `).all();

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
