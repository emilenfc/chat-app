document.addEventListener('DOMContentLoaded', () => {
    const socket = io('http://localhost:3000'); // Replace with your WebSocket server URL

    let currentUser = null;

    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showMainUI();
    } else {
        showLoginForm();
    }

    // Show login form
    function showLoginForm() {
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('registerForm').classList.remove('active');
        document.getElementById('userList').style.display = 'none';
        document.getElementById('groupList').style.display = 'none';
        document.getElementById('recentChats').style.display = 'none';
        document.getElementById('chatMessages').style.display = 'none';
        document.querySelector('.navbar').style.display = 'none'; // Hide navbar
    }

    // Show registration form
    document.getElementById('showRegisterForm').addEventListener('click', () => {
        document.getElementById('loginForm').classList.remove('active');
        document.getElementById('registerForm').classList.add('active');
        document.getElementById('userList').style.display = 'none';
        document.getElementById('groupList').style.display = 'none';
        document.getElementById('recentChats').style.display = 'none';
        document.getElementById('chatMessages').style.display = 'none';
        document.querySelector('.navbar').style.display = 'none'; // Hide navbar
    });

    // Show main UI after successful login
    function showMainUI() {
        document.getElementById('loginForm').classList.remove('active');
        document.getElementById('registerForm').classList.remove('active');
        document.getElementById('userList').style.display = 'block';
        document.getElementById('groupList').style.display = 'none';
        document.getElementById('recentChats').style.display = 'block';
        document.getElementById('chatMessages').style.display = 'none';
        document.querySelector('.navbar').style.display = 'block'; // Show navbar

        fetchUsers();
        fetchGroups();
        fetchRecentChats();

        // Listen for WebSocket events
        socket.on('privateMessage', handleMessage);
        socket.on('groupMessage', handleMessage);
        socket.on('userConnected', handleUserConnected);
        socket.on('userDisconnected', handleUserDisconnected);

        // Navigation event listeners
        document.getElementById('navUsers').addEventListener('click', () => {
            document.getElementById('userList').style.display = 'block';
            document.getElementById('groupList').style.display = 'none';
            document.getElementById('recentChats').style.display = 'none';
            document.getElementById('chatMessages').style.display = 'none';
        });

        document.getElementById('navGroups').addEventListener('click', () => {
            document.getElementById('userList').style.display = 'none';
            document.getElementById('groupList').style.display = 'block';
            document.getElementById('recentChats').style.display = 'none';
            document.getElementById('chatMessages').style.display = 'none';
        });

        document.getElementById('navRecent').addEventListener('click', () => {
            document.getElementById('userList').style.display = 'none';
            document.getElementById('groupList').style.display = 'none';
            document.getElementById('recentChats').style.display = 'block';
            document.getElementById('chatMessages').style.display = 'none';
        });
    }

    // Fetch and display all users
    async function fetchUsers() {
        const response = await fetch('http://localhost:3000/users');
        const users = await response.json();
        const usersList = document.getElementById('users');
        usersList.innerHTML = '';
        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user.username;
            li.addEventListener('click', () => {
                console.log(`User ${user} clicked`);
                startPrivateChat(user);
            });
            usersList.appendChild(li);
        });
    }

    // Fetch and display groups
    async function fetchGroups() {
        const response = await fetch('http://localhost:3000/groups');
        const groups = await response.json();
        const groupsList = document.getElementById('groups');
        groupsList.innerHTML = '';
        groups.forEach(group => {
            const li = document.createElement('li');
            li.textContent = `Group ${group.id}`;
            li.addEventListener('click', () => {
                startGroupChat(group.id);
            });
            groupsList.appendChild(li);
        });
    }

    // Fetch and display recent chats
    async function fetchRecentChats() {
        const response = await fetch(`http://localhost:3000/users/recent/${currentUser.id}`);
        const recentChats = await response.json();
        const recentList = document.getElementById('recent');
        recentList.innerHTML = '';
        recentChats.forEach(chat => {
            const li = document.createElement('li');
            li.textContent = chat.username; // Adjust according to response structure
            console.log("chat", chat)
            li.addEventListener('click', () => {
                startPrivateChat(chat);
            });
            recentList.appendChild(li);
        });
    }

    // Start private chat with a user
    function startPrivateChat(user) {
        document.getElementById('userList').style.display = 'none';
        document.getElementById('groupList').style.display = 'none';
        document.getElementById('recentChats').style.display = 'none';
        document.getElementById('chatMessages').style.display = 'block';
        fetchPrivateChatHistory(user.id);
        document.getElementById('sendMessage').addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("private chat", user)
            const message = document.getElementById('message').value;
            sendMessage('privateMessage', { receiver: user.username, content: message });
        });
    }

    // Start group chat
    function startGroupChat(groupId) {
        document.getElementById('userList').style.display = 'none';
        document.getElementById('groupList').style.display = 'none';
        document.getElementById('recentChats').style.display = 'none';
        document.getElementById('chatMessages').style.display = 'block';
        fetchGroupChatHistory(groupId);

        document.getElementById('sendMessage').addEventListener('submit', (e) => {
            e.preventDefault();
            const message = document.getElementById('message').value;
            sendMessage('groupMessage', { groupId, content: message });
        });
    }

    // Fetch private chat history
    async function fetchPrivateChatHistory(userId) {
        const response = await fetch(`http://localhost:3000/chat/private/${currentUser.id}/${userId}`);
        const messages = await response.json();
        const messagesList = document.getElementById('messages');
        messagesList.innerHTML = '';

        messages.forEach(message => {
            console.log("message sender and current user", message.sender, currentUser)
            const li = document.createElement('li');
            li.textContent = `${message.sender.username}: ${message.content}`;

            // Apply different styles for sender and receiver
            if (message.sender.id === currentUser.id) {
                li.classList.add('sent'); // Style for sent messages (right side)
            } else {
                li.classList.add('received'); // Style for received messages (left side)
            }

            messagesList.appendChild(li);
            messagesList.scrollTop = messagesList.scrollHeight;
            //get message from socket
            socket.on('privateMessage', (data) => {
                const message = data;
                const li = document.createElement('li');
                li.textContent = `${message.sender.username}: ${message.content}`;
                // Apply different styles for sender and receiver
                if (message.sender.id === currentUser.id) {
                    li.classList.add('sent'); // Style for sent messages (right side)
                } else {
                    li.classList.add('received'); // Style for received messages (left side)
                }
                messagesList.appendChild(li);
            });

            // Scroll to the bottom of the messages list
            messagesList.scrollTop = messagesList.scrollHeight;
        });
    }

    // Fetch group chat history
    async function fetchGroupChatHistory(groupId) {
        const response = await fetch(`http://localhost:3000/chat/group/${groupId}`);
        const messages = await response.json();
        const messagesList = document.getElementById('messages');
        messagesList.innerHTML = '';
        messages.forEach(message => {
            const li = document.createElement('li');
            li.textContent = `${message.sender.username} (Group ${groupId}): ${message.content}`;
            messagesList.appendChild(li);
        });
    }

    // Send message
    function sendMessage(eventType, data) {
        socket.emit(eventType, data);
        document.getElementById('message').value = ''; // Clear message input
    }

    // Handle incoming message
    function handleMessage(message) {
        const messagesList = document.getElementById('messages');
        const li = document.createElement('li');
        li.textContent = `${message.sender.username}: ${message.content}`;
        messagesList.appendChild(li);
    }

    // Handle user connected
    function handleUserConnected(user) {
        console.log(`${user.username} connected`);
        // Update UI or notify user
    }

    // Handle user disconnected
    function handleUserDisconnected(user) {
        console.log(`${user.username} disconnected`);
        // Update UI or notify user
    }

    // Handle login form submission
    document.getElementById('login').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const response = await fetch('http://localhost:3000/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            showMainUI();
        } else {
            alert('Login failed');
        }
    });

    // Handle registration form submission
    document.getElementById('register').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newUsername = document.getElementById('newUsername').value;
        const newPassword = document.getElementById('newPassword').value;

        const response = await fetch('http://localhost:3000/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: newUsername, password: newPassword })
        });

        if (response.ok) {
            alert('Registration successful. Please login.');
            showLoginForm();
        } else {
            alert('Registration failed');
        }
    });
})

