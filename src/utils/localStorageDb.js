import { categories, threads as initialThreads, posts as initialPosts } from '../data/mockData';

const KEYS = {
    USERS: 'forum_users',
    SESSION: 'forum_session',
    THREADS: 'forum_threads',
    POSTS: 'forum_posts',
    VOTES: 'forum_votes',
    NOTIFS: 'forum_notifications',
    ADMIN_LOGS: 'forum_admin_logs',
    ANNOUNCEMENT: 'forum_announcement'
};

// Only these keys are allowed for the core system rebuilt structure
const REQUIRED_KEYS = [
    KEYS.USERS,
    KEYS.THREADS,
    KEYS.SESSION,
    KEYS.ADMIN_LOGS,
    KEYS.NOTIFS
];

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

// --- STRICT VALIDATION & CLEANUP ---
export const validateAndCleanDatabase = () => {
    try {
        let users = JSON.parse(localStorage.getItem(KEYS.USERS)) || [];

        // Ensure array
        if (!Array.isArray(users)) {
            users = [];
        }

        // 1. Remove invalid shapes completely
        users = users.filter(u =>
            u &&
            typeof u === 'object' &&
            typeof u.id === 'string' &&
            typeof u.username === 'string' &&
            typeof u.password === 'string' &&
            typeof u.role === 'string'
        );

        // 2. Deduplicate by username (case-insensitive), keep the first occurrence
        const seenUsernames = new Set();
        const deduplicatedUsers = [];

        for (const u of users) {
            const lowerUser = u.username.toLowerCase();
            if (!seenUsernames.has(lowerUser)) {
                seenUsernames.add(lowerUser);
                deduplicatedUsers.push(u);
            }
        }
        users = deduplicatedUsers;

        // 3. Ensure ONE admin exists exactly. If admin is missing or deleted, recreate it.
        const adminIndex = users.findIndex(u => u.username.toLowerCase() === 'admin');
        const defaultAdmin = {
            id: 'u_admin_system',
            username: 'admin',
            password: btoa('admin123'), // encoded "admin123"
            role: 'admin',
            banned: false,
            karma: 0,
            createdAt: new Date().toISOString()
        };

        if (adminIndex === -1) {
            users.unshift(defaultAdmin);
        } else {
            // Force default admin password/role back to strictly correct values in case of corruption
            users[adminIndex].role = 'admin';
            users[adminIndex].banned = false; // Admins cannot be banned
            // If we strictly wanted to force password reset on corruption we could here, but we'll leave it in case they changed it legitimately via a non-existent UI.
            // For now, just ensure the shape is correct.
        }

        // Save cleaned users
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));

        // Ensure strictly allowed core arrays exist
        if (!localStorage.getItem(KEYS.THREADS)) localStorage.setItem(KEYS.THREADS, JSON.stringify([]));
        if (!localStorage.getItem(KEYS.ADMIN_LOGS)) localStorage.setItem(KEYS.ADMIN_LOGS, JSON.stringify([]));
        if (!localStorage.getItem(KEYS.NOTIFS)) localStorage.setItem(KEYS.NOTIFS, JSON.stringify({}));
        if (localStorage.getItem(KEYS.SESSION) === 'undefined') localStorage.removeItem(KEYS.SESSION);

    } catch (e) {
        console.error("Critical LocalStorage Corruption detected. Hard resetting user data.", e);
        hardResetDatabase();
    }
};

// --- HARD RESET ---
export const hardResetDatabase = () => {
    // 1. Clear forum-related items
    for (const key in localStorage) {
        if (key.startsWith('forum_')) {
            localStorage.removeItem(key);
        }
    }

    // 2. Initialize exactly strictly allowed keys
    localStorage.setItem(KEYS.USERS, JSON.stringify([]));
    localStorage.setItem(KEYS.THREADS, JSON.stringify([]));
    localStorage.setItem(KEYS.ADMIN_LOGS, JSON.stringify([]));
    localStorage.setItem(KEYS.NOTIFS, JSON.stringify({}));
    localStorage.removeItem(KEYS.SESSION);

    // 3. Immediately spawn clean admin
    validateAndCleanDatabase();

    // 4. Force reload to apply clean state globally
    window.location.reload();
};

// --- INITIALIZATION ---
export const initDb = () => {
    // Before doing anything, validate
    validateAndCleanDatabase();

    // Populate mock threads/posts ONLY if threads array is empty, for MVP visualization
    const currentThreads = JSON.parse(localStorage.getItem(KEYS.THREADS)) || [];
    if (currentThreads.length === 0) {
        localStorage.setItem(KEYS.THREADS, JSON.stringify(initialThreads));
        localStorage.setItem(KEYS.POSTS, JSON.stringify(initialPosts));
        localStorage.setItem(KEYS.VOTES, JSON.stringify({}));
        localStorage.setItem(KEYS.ANNOUNCEMENT, JSON.stringify(null));
    }
};

// --- AUTHENTICATION REBUILD ---
export const login = async (username, password) => {
    await delay(300);
    validateAndCleanDatabase(); // Pre-flight check

    const cleanUsername = username.trim().toLowerCase();
    const users = JSON.parse(localStorage.getItem(KEYS.USERS)) || [];

    // Strict exact match for username
    const user = users.find(u => u.username.toLowerCase() === cleanUsername);

    if (!user) {
        console.error("Auth Fail: Username not found.");
        throw new Error('Invalid username or password');
    }

    if (user.banned || user.isBanned) {
        console.error("Auth Fail: User banned.");
        throw new Error('Account suspended by an Administrator.');
    }

    // Decode stored password securely to compare exactly
    let decodedStoredPass = '';
    try {
        decodedStoredPass = atob(user.password);
    } catch (e) {
        console.error("Auth Fail: Corrupted password encoding inside DB.");
        throw new Error('Invalid username or password'); // Generic message to user
    }

    if (decodedStoredPass !== password.trim()) {
        console.error("Auth Fail: Password mismatch.");
        throw new Error('Invalid username or password');
    }

    // Create Strict Session
    const session = {
        id: user.id,
        username: user.username,
        role: user.role,
        loginTime: new Date().toISOString()
    };

    localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
    return session;
};

export const signup = async (username, password) => {
    await delay(300);
    validateAndCleanDatabase();

    const cleanUsername = username.trim();
    const lowerUsername = cleanUsername.toLowerCase();
    const cleanPassword = password.trim();

    if (cleanUsername.length < 3) throw new Error("Username must be at least 3 characters.");
    if (cleanPassword.length < 4) throw new Error("Password must be at least 4 characters.");

    const users = JSON.parse(localStorage.getItem(KEYS.USERS)) || [];

    // Strict Duplicate Check
    if (users.find(u => u.username.toLowerCase() === lowerUsername)) {
        console.error("Sign Up Fail: Duplicate username.");
        throw new Error('Username already taken');
    }

    // Valid User Structure
    const newUser = {
        id: `u_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        username: cleanUsername,
        password: btoa(cleanPassword), // encoded password
        role: 'user',
        banned: false,
        karma: 0,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));

    return login(cleanUsername, cleanPassword);
};

export const logout = async () => {
    await delay(100);
    localStorage.removeItem(KEYS.SESSION);
};

export const getSession = () => {
    try {
        validateAndCleanDatabase();
        const sessionStr = localStorage.getItem(KEYS.SESSION);
        if (!sessionStr) return null;

        const sessionObj = JSON.parse(sessionStr);
        if (!sessionObj || !sessionObj.id || !sessionObj.username) return null;

        // Ensure user actually still exists and isn't banned in DB right now
        const users = JSON.parse(localStorage.getItem(KEYS.USERS)) || [];
        const dbUser = users.find(u => u.id === sessionObj.id);

        if (!dbUser || dbUser.banned || dbUser.isBanned) {
            console.error("Session Invalidated: User deleted or banned in background.");
            localStorage.removeItem(KEYS.SESSION);
            return null;
        }

        // Return sync'd user info
        return {
            id: dbUser.id,
            username: dbUser.username,
            role: dbUser.role,
            bio: dbUser.bio,
            karma: dbUser.karma,
            joinedAt: dbUser.createdAt || dbUser.joinedAt
        };
    } catch (e) {
        localStorage.removeItem(KEYS.SESSION);
        return null;
    }
};


// --- USERS ---
export const getUserStats = async (username) => {
    await delay(200);
    const users = JSON.parse(localStorage.getItem(KEYS.USERS));
    const user = users.find(u => u.username === username);
    if (!user) throw new Error('User not found');

    const threads = JSON.parse(localStorage.getItem(KEYS.THREADS)).filter(t => t.author === username);

    // Very heavy loop for mock nested post counting, but fine for MVP
    const postsData = JSON.parse(localStorage.getItem(KEYS.POSTS));
    let replyCount = 0;

    const countReplies = (replies) => {
        replies.forEach(r => {
            if (r.author === username) replyCount++;
            if (r.replies) countReplies(r.replies);
        });
    };

    Object.values(postsData).forEach(p => {
        if (p.author === username) replyCount++;
        if (p.replies) countReplies(p.replies);
    });

    return {
        ...user,
        threadCount: threads.length,
        replyCount
    };
};

export const saveUserBio = async (userId, newBio) => {
    await delay();
    const users = JSON.parse(localStorage.getItem(KEYS.USERS));
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
        users[idx].bio = newBio;
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));

        // update session if it matches
        const session = JSON.parse(localStorage.getItem(KEYS.SESSION));
        if (session && session.user.id === userId) {
            session.user.bio = newBio;
            localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
        }
    }
};

// --- THREADS & POSTS ---
export const getCategories = async () => {
    await delay(100);
    return categories;
};

export const getThreads = async (categoryId = null) => {
    await delay();
    const ths = JSON.parse(localStorage.getItem(KEYS.THREADS));
    return categoryId ? ths.filter(t => t.categoryId === categoryId) : ths;
};

export const getThreadData = async (threadId) => {
    await delay();
    try {
        const rawThreads = localStorage.getItem(KEYS.THREADS);
        const ths = rawThreads ? JSON.parse(rawThreads) : [];
        const td = Array.isArray(ths) ? (ths.find(t => t.id === threadId) || null) : null;

        const rawPosts = localStorage.getItem(KEYS.POSTS);
        const posts = rawPosts ? JSON.parse(rawPosts) : {};
        const pd = (posts && typeof posts === 'object') ? (posts[threadId] || null) : null;

        if (pd && !Array.isArray(pd.replies)) {
            pd.replies = [];
        }

        return { thread: td, post: pd };
    } catch (e) {
        console.error("Error fetching thread data safely:", e);
        return { thread: null, post: null };
    }
};

export const createThread = async (userId, username, categoryId, title, text) => {
    await delay(600);
    const threadId = `t_${Date.now()}`;

    const thread = {
        id: threadId,
        categoryId,
        title,
        author: username,
        timestamp: new Date().toISOString(),
        replyCount: 0,
        isRead: true,
        votes: 1,
        isPinned: false,
        isLocked: false
    };

    const ths = JSON.parse(localStorage.getItem(KEYS.THREADS));
    ths.unshift(thread);
    localStorage.setItem(KEYS.THREADS, JSON.stringify(ths));

    const posts = JSON.parse(localStorage.getItem(KEYS.POSTS));
    posts[threadId] = {
        id: `p_${Date.now()}`,
        author: username,
        text,
        timestamp: new Date().toISOString(),
        votes: 1,
        replies: []
    };
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));

    // Store initial vote
    const votes = JSON.parse(localStorage.getItem(KEYS.VOTES));
    votes[`${threadId}_${userId}`] = 1;
    localStorage.setItem(KEYS.VOTES, JSON.stringify(votes));

    return threadId;
};

// Helper for deeply inserting replies
const _addReplyToTree = (targetId, currentReplies, newReply) => {
    return currentReplies.map(reply => {
        if (reply.id === targetId) {
            return {
                ...reply,
                replies: [...(reply.replies || []), newReply]
            };
        }
        if (reply.replies && reply.replies.length > 0) {
            return {
                ...reply,
                replies: _addReplyToTree(targetId, reply.replies, newReply)
            };
        }
        return reply;
    });
};

export const addReply = async (threadId, targetPostId, username, text, notifyUserId = null) => {
    await delay(300); // fake posting delay
    const posts = JSON.parse(localStorage.getItem(KEYS.POSTS));
    const postData = posts[threadId];

    if (!postData) throw new Error('Thread not found');

    const newReply = {
        id: `r_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        author: username,
        text,
        timestamp: new Date().toISOString(),
        votes: 0,
        replies: []
    };

    if (targetPostId === postData.id) {
        postData.replies.push(newReply);
    } else {
        postData.replies = _addReplyToTree(targetPostId, postData.replies || [], newReply);
    }

    posts[threadId] = postData;
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));

    // Update thread reply count
    const ths = JSON.parse(localStorage.getItem(KEYS.THREADS));
    const td = ths.find(t => t.id === threadId);
    if (td) {
        td.replyCount += 1;
        localStorage.setItem(KEYS.THREADS, JSON.stringify(ths));
    }

    // Create notification if notifying someone else
    if (notifyUserId && notifyUserId !== username) {
        addNotification(notifyUserId, `${username} replied to your post.`);
    }

    return newReply;
};

// --- VIEWS ---
export const incrementThreadView = async (threadId) => {
    try {
        const rawThreads = localStorage.getItem(KEYS.THREADS);
        if (!rawThreads) return;
        const ths = JSON.parse(rawThreads);
        if (!Array.isArray(ths)) return;

        const td = ths.find(t => t.id === threadId);
        if (td) {
            td.views = (td.views || 0) + 1;
            localStorage.setItem(KEYS.THREADS, JSON.stringify(ths));
        }
    } catch (e) {
        console.error("Error incrementing thread views safely:", e);
    }
};

// --- LIKES (VOTES) ---
export const toggleLike = async (itemId, isThread, userId, authorOfItem = null) => {
    const votes = JSON.parse(localStorage.getItem(KEYS.VOTES)) || {};
    const voteKey = `${itemId}_${userId}`;
    const isLiked = !!votes[voteKey];

    // Toggle logic
    let difference = 0;
    if (isLiked) {
        difference = -1;
        delete votes[voteKey];
    } else {
        difference = 1;
        votes[voteKey] = 1;
    }

    localStorage.setItem(KEYS.VOTES, JSON.stringify(votes));

    // Update Item (Thread or Post)
    if (isThread) {
        const ths = JSON.parse(localStorage.getItem(KEYS.THREADS));
        const td = ths.find(t => t.id === itemId);
        if (td) {
            td.votes = (td.votes || 0) + difference; // 'votes' now acts as 'likes'
            localStorage.setItem(KEYS.THREADS, JSON.stringify(ths));
        }
    } else {
        const posts = JSON.parse(localStorage.getItem(KEYS.POSTS));

        let found = false;
        const updateLikeInTree = (node) => {
            if (node.id === itemId) {
                node.votes = (node.votes || 0) + difference;
                found = true;
            } else if (node.replies) {
                node.replies.forEach(updateLikeInTree);
            }
        };

        // We don't know the threadId here, search all
        Object.values(posts).forEach(mainPost => {
            if (!found) updateLikeInTree(mainPost);
        });

        localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
    }

    // Award Likes to author
    if (authorOfItem && authorOfItem !== 'CurrentUser') {
        const users = JSON.parse(localStorage.getItem(KEYS.USERS));
        const author = users.find(u => u.username === authorOfItem);
        if (author) {
            author.karma = (author.karma || 0) + difference; // Karma is now total likes
            localStorage.setItem(KEYS.USERS, JSON.stringify(users));
        }
    }

    return !isLiked; // Return true if now liked, false if unliked
};

export const getUserLikeStatus = (itemId, userId) => {
    const votes = JSON.parse(localStorage.getItem(KEYS.VOTES)) || {};
    return !!votes[`${itemId}_${userId}`];
};

// --- NOTIFICATIONS ---
export const addNotification = (username, message) => {
    const notifs = JSON.parse(localStorage.getItem(KEYS.NOTIFS));
    if (!notifs[username]) notifs[username] = [];

    notifs[username].unshift({
        id: `n_${Date.now()}`,
        message,
        read: false,
        timestamp: new Date().toISOString()
    });

    localStorage.setItem(KEYS.NOTIFS, JSON.stringify(notifs));
};

export const getNotifications = (username) => {
    const notifs = JSON.parse(localStorage.getItem(KEYS.NOTIFS));
    return notifs[username] || [];
};

export const markNotificationsRead = (username) => {
    const notifs = JSON.parse(localStorage.getItem(KEYS.NOTIFS));
    if (notifs[username]) {
        notifs[username].forEach(n => n.read = true);
        localStorage.setItem(KEYS.NOTIFS, JSON.stringify(notifs));
    }
};

// --- ADMIN ---
export const deleteThread = async (threadId) => {
    await delay(400);
    let ths = JSON.parse(localStorage.getItem(KEYS.THREADS));
    ths = ths.filter(t => t.id !== threadId);
    localStorage.setItem(KEYS.THREADS, JSON.stringify(ths));

    const posts = JSON.parse(localStorage.getItem(KEYS.POSTS));
    delete posts[threadId];
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
};

export const deleteReply = async (threadId, replyId) => {
    await delay(300);
    const posts = JSON.parse(localStorage.getItem(KEYS.POSTS));
    const postData = posts[threadId];

    if (!postData) return;

    // Recursive deletion from tree
    const removeNode = (nodes, idToRemove) => {
        return nodes.filter(node => node.id !== idToRemove).map(node => ({
            ...node,
            replies: node.replies ? removeNode(node.replies, idToRemove) : []
        }));
    };

    if (postData.id === replyId) {
        // Can't delete the root post via deleteReply, use deleteThread
        return;
    }

    if (postData.replies) {
        postData.replies = removeNode(postData.replies, replyId);
    }

    posts[threadId] = postData;
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));

    // Update reply count estimation heavily
    const ths = JSON.parse(localStorage.getItem(KEYS.THREADS));
    const td = ths.find(t => t.id === threadId);
    if (td) {
        td.replyCount = Math.max(0, td.replyCount - 1);
        localStorage.setItem(KEYS.THREADS, JSON.stringify(ths));
    }
};

export const editThread = async (threadId, newTitle, newBody, isAnnouncement = false) => {
    await delay(200);
    const threads = JSON.parse(localStorage.getItem(KEYS.THREADS));
    const t = threads.find(x => x.id === threadId);
    if (t) {
        t.title = newTitle;
        t.body = newBody;
        t.isAnnouncement = isAnnouncement;
        t.isEditedByAdmin = true;
        localStorage.setItem(KEYS.THREADS, JSON.stringify(threads));
    }
};

export const pinThread = async (threadId, isPinned) => {
    await delay(200);
    const ths = JSON.parse(localStorage.getItem(KEYS.THREADS));
    const td = ths.find(t => t.id === threadId);
    if (td) {
        td.isPinned = isPinned;
        localStorage.setItem(KEYS.THREADS, JSON.stringify(ths));
    }
};

export const lockThread = async (threadId, isLocked) => {
    await delay(200);
    const ths = JSON.parse(localStorage.getItem(KEYS.THREADS));
    const td = ths.find(t => t.id === threadId);
    if (td) {
        td.isLocked = isLocked;
        localStorage.setItem(KEYS.THREADS, JSON.stringify(ths));
    }
};

export const editPost = async (threadId, postId, newText) => {
    await delay(300);
    const posts = JSON.parse(localStorage.getItem(KEYS.POSTS));
    const postData = posts[threadId];

    if (!postData) return;

    let found = false;
    const updateText = (node) => {
        if (node.id === postId) {
            node.text = newText;
            node.isEditedByAdmin = true;
            found = true;
        } else if (node.replies) {
            node.replies.forEach(updateText);
        }
    };

    updateText(postData);
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
};

export const getAllUsers = async () => {
    await delay(200);
    return JSON.parse(localStorage.getItem(KEYS.USERS));
};

export const banUser = async (userId) => {
    await delay(100);
    const users = JSON.parse(localStorage.getItem(KEYS.USERS)) || [];
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
        users[index].isBanned = true;
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }
};

export const unbanUser = async (userId) => {
    await delay(100);
    const users = JSON.parse(localStorage.getItem(KEYS.USERS)) || [];
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
        users[index].isBanned = false;
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }
};

export const deleteUserAccount = async (userId) => {
    await delay(300);
    let users = JSON.parse(localStorage.getItem(KEYS.USERS)) || [];
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    // Delete User
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));

    // Cleanup: In a real system we might cascade delete or orphan their posts.
    // For this MVP, we will leave posts as "Deleted User" to keep thread continuity,
    // or just wipe their threads entirely to be safe. We'll wipe their threads:
    let threads = JSON.parse(localStorage.getItem(KEYS.THREADS)) || [];
    threads = threads.filter(t => t.author !== targetUser.username);
    localStorage.setItem(KEYS.THREADS, JSON.stringify(threads));

    // Wipe their votes
    let votes = JSON.parse(localStorage.getItem(KEYS.VOTES)) || {};
    Object.keys(votes).forEach(voteKey => {
        if (voteKey.includes(`_${userId}`)) {
            delete votes[voteKey];
        }
    });
    localStorage.setItem(KEYS.VOTES, JSON.stringify(votes));
};

export const logAdminActivity = (action, target) => {
    const logs = JSON.parse(localStorage.getItem(KEYS.ADMIN_LOGS)) || [];
    logs.unshift({
        id: `log_${Date.now()}`,
        action,
        target,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem(KEYS.ADMIN_LOGS, JSON.stringify(logs));
};

export const getAdminLogs = async () => {
    await delay(200);
    return JSON.parse(localStorage.getItem(KEYS.ADMIN_LOGS)) || [];
};

export const getAnnouncement = async () => {
    await delay(100);
    return JSON.parse(localStorage.getItem(KEYS.ANNOUNCEMENT));
};

export const setAnnouncement = async (text) => {
    await delay(200);
    localStorage.setItem(KEYS.ANNOUNCEMENT, JSON.stringify(text));
};

export const clearAnnouncement = async () => {
    await delay(200);
    localStorage.setItem(KEYS.ANNOUNCEMENT, JSON.stringify(null));
};

// Search 
export const searchContent = async (query) => {
    await delay(300);
    const q = query.toLowerCase();

    const ths = JSON.parse(localStorage.getItem(KEYS.THREADS)) || [];
    const posts = JSON.parse(localStorage.getItem(KEYS.POSTS)) || {};
    const matchedThreadsSet = new Set();
    const matchedThreads = [];

    // Search titles
    ths.forEach(t => {
        if (t.title.toLowerCase().includes(q)) {
            matchedThreadsSet.add(t.id);
            matchedThreads.push(t);
        }
    });

    // Search main post bodies and nested replies
    const searchInTree = (node, threadId) => {
        if (!matchedThreadsSet.has(threadId) && node.text && node.text.toLowerCase().includes(q)) {
            matchedThreadsSet.add(threadId);
            const t = ths.find(tr => tr.id === threadId);
            if (t) matchedThreads.push(t);
        }
        if (node.replies) {
            node.replies.forEach(child => searchInTree(child, threadId));
        }
    };

    Object.keys(posts).forEach(threadId => {
        searchInTree(posts[threadId], threadId);
    });

    const users = JSON.parse(localStorage.getItem(KEYS.USERS)) || [];
    const matchedUsers = users.filter(u => u.username.toLowerCase().includes(q));

    return { threads: matchedThreads, users: matchedUsers };
};
