import CalendarEvent from '../models/calendarModel.js';

export const listEvents = async (req, res) => {
	try {
		const userId = req.query.userId || req.body.userId || req.user?._id;
		if (!userId) return res.status(400).json({ error: 'userId required' });
		const events = await CalendarEvent.find({ userId }).sort({ start: 1 });
		res.json(events);
	} catch (e) {
		res.status(500).json({ error: 'Failed to list events' });
	}
};

export const createEvent = async (req, res) => {
	try {
		const { userId, title, description, start, end, allDay, priority } = req.body;
		if (!userId || !title || !start) return res.status(400).json({ error: 'userId, title, start required' });
		const ev = await CalendarEvent.create({ userId, title, description, start, end, allDay, priority: priority || 'low' });
		res.status(201).json(ev);
	} catch (e) {
		res.status(500).json({ error: 'Failed to create event' });
	}
};

export const updateEvent = async (req, res) => {
	try {
		const { id } = req.params;
		const { title, description, start, end, allDay, priority } = req.body;
		const ev = await CalendarEvent.findByIdAndUpdate(id, { title, description, start, end, allDay, priority: priority || 'low' }, { new: true });
		if (!ev) return res.status(404).json({ error: 'Not found' });
		res.json(ev);
	} catch (e) {
		res.status(500).json({ error: 'Failed to update event' });
	}
};

export const deleteEvent = async (req, res) => {
	try {
		const { id } = req.params;
		const ev = await CalendarEvent.findByIdAndDelete(id);
		if (!ev) return res.status(404).json({ error: 'Not found' });
		res.json({ success: true });
	} catch (e) {
		res.status(500).json({ error: 'Failed to delete event' });
	}
};
