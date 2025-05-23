// ==UserScript==
// @name         T3 Chat Project
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Add project to t3.chat
// @author       idontknowhoaiam
// @match        https://t3.chat/*
// @match        https://t3.chat/chat*
// @match        https://beta.t3.chat/*
// @match        https://beta.t3.chat/chat/*
// @grant        none
// @run-at       document-idle
// @noframes
// ==/UserScript==

// Add debug information and browser detection
(function() {
    'use strict';

    // Immediately output debug information
    console.log('🚀 [T3 Chat Script] Script loading started...');
    console.log('🌐 [T3 Chat Script] Current URL:', window.location.href);
    console.log('🔍 [T3 Chat Script] User Agent:', navigator.userAgent);

    // Detect browser type
    const isArc = navigator.userAgent.includes('Arc') || window.chrome?.app?.isInstalled === false;
    const isChrome = !isArc && /Chrome/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    console.log('🔧 [T3 Chat Script] Browser detection:', {
        isArc: isArc,
        isChrome: isChrome,
        isSafari: isSafari,
        hasChrome: !!window.chrome,
        hasTampermonkey: !!window.Tampermonkey
    });

    // Check Tampermonkey status
    if (typeof GM_info !== 'undefined') {
        console.log('✅ [T3 Chat Script] Tampermonkey detected successfully:', GM_info);
    } else {
        console.log('⚠️ [T3 Chat Script] Tampermonkey GM_info not detected');
    }

    // Arc specific initialization delay
    if (isArc) {
        console.log('🎯 [T3 Chat Script] Arc browser detected, applying special handling...');
        // Arc might need a longer initialization time
        window.ARC_BROWSER_DETECTED = true;
    }
})();

// --- Start of Polyfill for browser/chrome.runtime ---
(function() {
    'use strict';

    var cr = window.chrome = window.chrome || {};
    cr.runtime = cr.runtime || {};
    cr.extension = cr.runtime; // Alias chrome.extension to chrome.runtime

    var br = window.browser = window.browser || {};
    if (typeof br.runtime !== 'object' || br.runtime === null) {
        br.runtime = cr.runtime; // Alias if browser.runtime is not a distinct object
    }
    br.extension = br.runtime; // Alias browser.extension to whatever browser.runtime is (either cr.runtime or its own object)

    // Polyfill chrome.runtime.connect
    if (typeof cr.runtime.connect !== 'function') {
        cr.runtime.connect = function(extensionId, connectInfo) {
            return {
                name: connectInfo ? connectInfo.name : undefined,
                onMessage: {
                    addListener: function(callback) {},
                    removeListener: function(callback) {}
                },
                onDisconnect: {
                    addListener: function(callback) {},
                    removeListener: function(callback) {}
                },
                postMessage: function(message) {}
            };
        };
    }

    // Polyfill chrome.runtime.onMessage
    cr.runtime.onMessage = cr.runtime.onMessage || {};
    if (typeof cr.runtime.onMessage.addListener !== 'function') {
        cr.runtime.onMessage.addListener = function(callback) {};
    }
    if (typeof cr.runtime.onMessage.removeListener !== 'function') {
        cr.runtime.onMessage.removeListener = function(callback) {};
    }
    if (typeof cr.runtime.onMessage.hasListener !== 'function') {
        cr.runtime.onMessage.hasListener = function(callback) { return false; };
    }
    if (typeof cr.runtime.onMessage.hasListeners !== 'function') { // Common alternative
        cr.runtime.onMessage.hasListeners = function() { return false; };
    }

    // Polyfill chrome.runtime.sendMessage
    if (typeof cr.runtime.sendMessage !== 'function') {
        cr.runtime.sendMessage = function(extensionId, message, options, callback) {
            let cb = callback;
            if (typeof options === 'function') { cb = options; options = undefined; }
            else if (typeof message === 'function' && arguments.length < 3) { cb = message; message = undefined; extensionId = undefined; }


            if (cb) {
                setTimeout(() => cb(undefined), 0);
            }
            return Promise.resolve(undefined);
        };
    }

    // Polyfill for top-level chrome.runtime.addListener
    if (typeof cr.runtime.addListener !== 'function') {
        cr.runtime.addListener = function(callback) {};
    }

    // Polyfill chrome.runtime.getURL
    if (typeof cr.runtime.getURL !== 'function') {
        cr.runtime.getURL = function(path) { return path || ''; };
    }

    // Polyfill chrome.runtime.getManifest
    if (typeof cr.runtime.getManifest !== 'function') {
        cr.runtime.getManifest = function() { return { manifest_version: 2, name: "Polyfilled Extension", version: "0.0" }; };
    }

    // Ensure lastError property exists and is queryable
    if (!Object.prototype.hasOwnProperty.call(cr.runtime, 'lastError')) {
        let _lastError = null;
        Object.defineProperty(cr.runtime, 'lastError', {
            get: function() { return _lastError; },
            set: function(e) { _lastError = e; },
            configurable: true
        });
    }

    // --- Ensure browser.runtime has the same polyfills if it's a separate object ---
    if (br.runtime !== cr.runtime) { // If browser.runtime was its own distinct object
        // Ensure br.extension points to this distinct br.runtime, not the cr.runtime alias if it was overwritten
        br.extension = br.runtime;

        if (typeof br.runtime.connect !== 'function') { br.runtime.connect = cr.runtime.connect; }

        br.runtime.onMessage = br.runtime.onMessage || {};
        if (typeof br.runtime.onMessage.addListener !== 'function') { br.runtime.onMessage.addListener = cr.runtime.onMessage.addListener; }
        if (typeof br.runtime.onMessage.removeListener !== 'function') { br.runtime.onMessage.removeListener = cr.runtime.onMessage.removeListener; }
        if (typeof br.runtime.onMessage.hasListener !== 'function') { br.runtime.onMessage.hasListener = cr.runtime.onMessage.hasListener; }
        if (typeof br.runtime.onMessage.hasListeners !== 'function') { br.runtime.onMessage.hasListeners = cr.runtime.onMessage.hasListeners; }

        if (typeof br.runtime.sendMessage !== 'function') { br.runtime.sendMessage = cr.runtime.sendMessage; }
        if (typeof br.runtime.addListener !== 'function') { br.runtime.addListener = cr.runtime.addListener; }
        if (typeof br.runtime.getURL !== 'function') { br.runtime.getURL = cr.runtime.getURL; }
        if (typeof br.runtime.getManifest !== 'function') { br.runtime.getManifest = cr.runtime.getManifest; }

        if (!Object.prototype.hasOwnProperty.call(br.runtime, 'lastError')) {
             Object.defineProperty(br.runtime, 'lastError', {
                get: function() { return cr.runtime.lastError; }, // Access polyfilled chrome's lastError
                set: function(e) { if (cr.runtime) cr.runtime.lastError = e; }, // Set polyfilled chrome's lastError
                configurable: true
            });
        }
    }
})();
// --- End of Polyfill ---

// Global variables and functions, ensure they are accessible externally
window.STORAGE_KEY = 't3chat_projects';

// Flag to prevent re-execution
window.T3_CHAT_INITIALIZED = false;
window.T3_CHAT_INITIALIZING = false;

// Ensure these functions are available in the global scope
window.generateUniqueId = function() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// These functions will be initialized inside the IIFE
window.createProjectItem = null;
window.loadProjectsFromStorage = null;
window.saveProjectsToStorage = null;
window.makeProjectContainersDroppable = null; // Keep declaration, IIFE will assign value
window.updateProjectUI = null;
window.toggleProjectContent = null; // Added this as it's globally assigned in setupGlobalFunctions

// Add global functions related to the All button
window.getCurrentProjectId = function() {
    const currentUrl = window.location.pathname;
    const projects = window.loadProjectsFromStorage ? window.loadProjectsFromStorage() : [];

    for (const project of projects) {
        if (project.chats && project.chats.length > 0) {
            const chatInProject = project.chats.find(chat =>
                chat.url === currentUrl || chat.url.includes(currentUrl.split('/').pop())
            );
            if (chatInProject) {
                return project.id;
            }
        }
    }
    return null;
};

window.createAllButton = function() {
    try {
        console.log('🔘 [All Button] Starting to create All button...');

        // Check if in a Project chat
        const projectId = window.getCurrentProjectId();

        // Find existing All button
        const existingButton = document.querySelector('#all-mode-toggle');

        if (!projectId) {
            console.log('🔘 [All Button] Not in a Project chat');

            // If not in a Project chat, remove the existing All button
            if (existingButton) {
                console.log('🔘 [All Button] Removing existing All button');
                existingButton.remove();

                // Clear related state
                window.projectAllModeData = null;
                if (window.removeProjectAllModeInterceptor) {
                    window.removeProjectAllModeInterceptor();
                }
            }
            return false;
        }

        // Check if All button already exists - stricter check
        if (existingButton) {
            // Check if the button belongs to the current project
            const buttonProjectId = existingButton.getAttribute('data-project-id');
            if (buttonProjectId === projectId) {
                console.log('🔘 [All Button] Button for the same Project already exists');
                return true; // Button for the same project already exists
            } else {
                // Remove button from other project
                console.log('🔘 [All Button] Removing button from other Project');
                existingButton.remove();

                // Clear related state
                window.projectAllModeData = null;
                if (window.removeProjectAllModeInterceptor) {
                    window.removeProjectAllModeInterceptor();
                }
            }
        }

        // Find send button container
        const sendButton = document.querySelector('button[type="submit"]');
        if (!sendButton) {
            console.log('🔘 [All Button] Send button not found');
            return false;
        }

        const targetContainer = sendButton.parentElement;
        if (!targetContainer) {
            console.log('🔘 [All Button] Parent container of send button not found');
            return false;
        }

        console.log('🔘 [All Button] Target container found, preparing to create button');

        // All button defaults to off state
        let isAllModeActive = false;

        // Create All button
        const allButton = document.createElement('button');
        allButton.id = 'all-mode-toggle';
        allButton.type = 'button';
        allButton.title = 'All Mode: Send all Project conversations to AI';
        allButton.setAttribute('data-project-id', projectId);

        // Function to update button style
        const updateButtonStyle = (active) => {
            if (active) {
                // On state - pink style
                allButton.className = 'inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 disabled:cursor-not-allowed hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 px-3 text-xs -mb-1.5 h-auto gap-2 rounded-full border border-solid border-secondary-foreground/10 py-1.5 pl-2 pr-2.5 text-muted-foreground hover:bg-pink-500/2 bg-pink-500/15';
                allButton.innerHTML = 'All';
            } else {
                // Off state - original style
                allButton.className = 'inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 disabled:cursor-not-allowed hover:bg-muted/40 hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-foreground/50 px-3 text-xs -mb-1.5 h-auto gap-2 rounded-full border border-solid border-secondary-foreground/10 py-1.5 pl-2 pr-2.5 text-muted-foreground';
                allButton.innerHTML = 'All';
            }
        };

        // Initialize button style to off state
        updateButtonStyle(false);

        // Add click event
        allButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Toggle state
            isAllModeActive = !isAllModeActive;
            updateButtonStyle(isAllModeActive);

            console.log(`🔘 [All Button] All mode ${isAllModeActive ? 'ON' : 'OFF'}`);

            if (isAllModeActive) {
                // All mode ON logic - collect all Project chat messages in the background
                const projects = window.loadProjectsFromStorage();
                const currentProject = projects.find(p => p.id === projectId);

                if (currentProject && currentProject.chats && currentProject.chats.length > 0) {
                    console.log(`🔘 [All Button] All mode is ON, starting background collection of messages for Project "${currentProject.title}"...`);

                    // Display collection progress
                    allButton.innerHTML = 'Collecting...';
                    allButton.disabled = true;

                    // Collect and temporarily store all Project messages in the background
                    setTimeout(() => {
                        try {
                            const messagesData = window.getAllProjectMessages();

                            if (messagesData.success) {
                                // Temporarily store collected messages in a global variable
                                window.projectAllModeData = {
                                    projectId: messagesData.projectId,
                                    projectTitle: messagesData.projectTitle,
                                    collectedAt: Date.now(),
                                    totalChats: messagesData.totalChats,
                                    availableChats: messagesData.availableChats,
                                    chats: messagesData.chats,
                                    allMessages: messagesData.allMessages,
                                    totalMessages: messagesData.totalMessages,
                                    contextPrompt: messagesData.contextPrompt,
                                    cacheStats: messagesData.cacheStats
                                };

                                console.log(`🔘 [All Button] ✅ Full message library loaded: ${messagesData.totalMessages} messages from ${messagesData.availableChats}/${messagesData.totalChats} conversations`);

                                // Set up send interceptor
                                window.setupProjectAllModeInterceptor();

                                // Restore button state
                                allButton.innerHTML = 'All';
                                allButton.disabled = false;
                                updateButtonStyle(true);

                            } else if (messagesData.autoCollecting) {
                                // Auto-collecting, restore button but keep it enabled
                                allButton.innerHTML = 'All';
                                allButton.disabled = false;
                                updateButtonStyle(true);

                            } else {
                                console.log('🔘 [All Button] Failed to get Project messages:', messagesData.message);

                                // Collection failed, reset button state
                                isAllModeActive = false;
                                allButton.innerHTML = 'All';
                                allButton.disabled = false;
                                updateButtonStyle(false);
                            }
                        } catch (error) {
                            console.error('🔘 [All Button] Error collecting messages:', error);

                            // Collection error, reset button state
                            isAllModeActive = false;
                            allButton.innerHTML = 'All';
                            allButton.disabled = false;
                            updateButtonStyle(false);
                        }
                    }, 300);
                }
            } else {
                console.log('🔘 [All Button] All mode is OFF, clearing temporary data...');

                // Clear temporary message data
                window.projectAllModeData = null;

                // Remove send interceptor
                if (window.removeProjectAllModeInterceptor) {
                    window.removeProjectAllModeInterceptor();
                }
            }
        });

        // Insert All button before send button (to the left)
        targetContainer.insertBefore(allButton, sendButton);

        console.log('🔘 [All Button] ✅ All button created successfully, positioned to the left of the send button');
        return true;

    } catch (error) {
        console.error('🔘 [All Button] ❌ Error creating All button:', error);
        return false;
    }
};

// Add addChatToProject to global scope
window.addChatToProject = null;

// Send interceptor - combines Project messages with user input
window.projectAllModeInterceptorActive = false;

// Set up send interceptor
window.setupProjectAllModeInterceptor = function() {
    if (window.projectAllModeInterceptorActive) {
        console.log('🔄 [Send Interceptor] Interceptor already active');
        return;
    }

    console.log('🔄 [Send Interceptor] Setting up send interceptor...');
    window.projectAllModeInterceptorActive = true;

    // Intercept fetch requests (most modern chat apps use fetch)
    const originalFetch = window.fetch;

    window.fetch = async function(url, options = {}) {
        try {
            // Check if it's a chat send request
            const isChatRequest = url.includes('/chat') || url.includes('/api') ||
                                (options.method === 'POST' && options.body);

            if (isChatRequest && window.projectAllModeData && options.body) {
                console.log('🔄 [Send Interceptor] Intercepted chat send request');

                let requestData;
                let originalMessage = '';

                // Parse request data
                if (typeof options.body === 'string') {
                    try {
                        requestData = JSON.parse(options.body);
                        if (requestData.message) {
                            originalMessage = requestData.message;
                        } else if (requestData.messages && requestData.messages.length > 0) {
                            const lastMessage = requestData.messages[requestData.messages.length - 1];
                            originalMessage = lastMessage.content || lastMessage.message || '';
                        }
                    } catch (e) {
                        // If not JSON, might be plain text
                        originalMessage = options.body;
                    }
                } else if (options.body instanceof FormData) {
                    // Handle FormData
                    originalMessage = options.body.get('message') || options.body.get('content') || '';
                }

                if (originalMessage && originalMessage.trim()) {
                    console.log(`🔄 [Send Interceptor] Original message: ${originalMessage.substring(0, 100)}...`);

                    // Combine Project context and user message
                    const combinedMessage = window.projectAllModeData.contextPrompt +
                                          `\nUser Question: ${originalMessage}` +
                                          `\n\nPlease answer my question based on the conversations in the Project "${window.projectAllModeData.projectTitle}" above.`;

                    // Modify request data
                    if (requestData) {
                        if (requestData.message) {
                            requestData.message = combinedMessage;
                        } else if (requestData.messages && requestData.messages.length > 0) {
                            const lastMessage = requestData.messages[requestData.messages.length - 1];
                            if (lastMessage.content) {
                                lastMessage.content = combinedMessage;
                            } else if (lastMessage.message) {
                                lastMessage.message = combinedMessage;
                            }
                        }
                        options.body = JSON.stringify(requestData);
                    } else if (options.body instanceof FormData) {
                        options.body.set('message', combinedMessage);
                    } else if (typeof options.body === 'string') {
                        options.body = combinedMessage;
                    }

                    console.log(`🔄 [Send Interceptor] ✅ Project context combined with user message and sent`);
                }
            }

            // Continue original request
            return originalFetch.call(this, url, options);

        } catch (error) {
            console.error('🔄 [Send Interceptor] Interceptor processing error:', error);
            return originalFetch.call(this, url, options);
        }
    };

    // Save original fetch for restoration
    window.originalFetch = originalFetch;

    console.log('🔄 [Send Interceptor] ✅ Fetch interceptor setup complete');
};

// Remove send interceptor
window.removeProjectAllModeInterceptor = function() {
    if (!window.projectAllModeInterceptorActive) {
        return;
    }

    console.log('🔄 [Send Interceptor] Removing interceptor...');

    // Restore original fetch function
    if (window.originalFetch) {
        window.fetch = window.originalFetch;
        delete window.originalFetch;
        console.log('🔄 [Send Interceptor] Original fetch function restored');
    }

    // Reset state
    window.projectAllModeInterceptorActive = false;

    console.log('🔄 [Send Interceptor] ✅ Interceptor removed');
};

(function() {
    'use strict';
    const SCRIPT_PREFIX = '[TM Button Width Adjust v0.4.1]'; // Updated version number
    const STORAGE_KEY = window.STORAGE_KEY; // Use the global STORAGE_KEY

    // Prevent selection-related errors
    Object.defineProperty(window, 'getPosition', {
        value: function() {
            try {
                // Backup of original getPosition function or empty implementation
                return { start: 0, end: 0 };
            } catch (e) {
                console.error(`${SCRIPT_PREFIX} getPosition error intercepted:`, e);
                return { start: 0, end: 0 };
            }
        },
        writable: true,
        configurable: true
    });

    // Intercept possible selectionStart errors
    const originalElementPrototypeGetters = {};
    ['selectionStart', 'selectionEnd'].forEach(prop => {
        const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, prop);
        if (descriptor && descriptor.get) {
            originalElementPrototypeGetters[prop] = descriptor.get;

            Object.defineProperty(HTMLInputElement.prototype, prop, {
                get: function() {
                    try {
                        if (!this || this === null) return 0;
                        return originalElementPrototypeGetters[prop].call(this);
                    } catch (e) {
                        console.error(`${SCRIPT_PREFIX} Safe ${prop} access error intercepted:`, e);
                        return 0;
                    }
                },
                configurable: true
            });
        }
    });

    // Add global error handling for Promises to prevent unhandled errors from appearing in the console
    window.addEventListener('unhandledrejection', function(event) {
        event.preventDefault();
        // Silently handle all unhandled Promise errors
        // console.warn(`${SCRIPT_PREFIX} Unhandled Promise error silenced:, event.reason);
    });

    // Load projects from local storage
    const loadProjectsFromStorage = () => {
        try {
            const projectsJson = localStorage.getItem(STORAGE_KEY);
            return projectsJson ? JSON.parse(projectsJson) : [];
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Failed to load projects:`, error);
            return [];
        }
    };

    // Save projects to local storage
    const saveProjectsToStorage = (projects) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Failed to save projects:`, error);
        }
    };

    // Drag diagnostics and force override feature
    const enableDragDiagnostics = () => {
        console.log(`${SCRIPT_PREFIX} ===== Starting Drag Diagnostics and Force Override =====`);

        // Remove any existing colored dots
        document.querySelectorAll('.force-drag-marker, .force-drop-marker').forEach(marker => {
            if (marker && marker.parentNode) {
                marker.parentNode.removeChild(marker);
            }
        });

        const allPossibleChatItems = document.querySelectorAll('a[href^="/chat/"], a[data-discover="true"], div[data-sidebar="content"] a');
        console.log(`${SCRIPT_PREFIX} Found ${allPossibleChatItems.length} possible chat items`);

        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (type === 'dragstart' || type === 'drop') {
                // console.log(`${SCRIPT_PREFIX} Detected event listener: ${type} on, this);
            }
            return originalAddEventListener.call(this, type, listener, options);
        };

        const originalPreventDefault = Event.prototype.preventDefault;
        Event.prototype.preventDefault = function() {
            if (this.type === 'dragstart' || this.type === 'drop') {
                // console.warn(`${SCRIPT_PREFIX} [Drag Diagnostics] Detected preventDefault for: ${this.type}, this);
                const target = this.target || this.srcElement;
                if (target && target.getAttribute && target.getAttribute('data-manual-drag') === 'true') {
                    // console.log(`${SCRIPT_PREFIX} [Drag Diagnostics] Allowing preventDefault for manual drag event);
                    return originalPreventDefault.call(this);
                }
                return;
            }
            return originalPreventDefault.call(this);
        };

        document.addEventListener('mousedown', function(e) {
            const chatItem = e.target.closest('a[href^="/chat/"]:not([data-project-id])');
            if (!chatItem) return;
            if (chatItem.getAttribute('data-mac-drag-fixed') === 'true') return;

            chatItem.setAttribute('data-mac-drag-fixed', 'true');
            // console.log(`${SCRIPT_PREFIX} [macOS Drag Fix] Adding drag support to element, chatItem);
            chatItem.setAttribute('draggable', 'true');

            if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
                // console.log(`${SCRIPT_PREFIX} [macOS Drag Fix] Safari detected, applying special handling);
                chatItem.addEventListener('mousedown', function(downEvent) {
                    this.setAttribute('data-safari-dragging', 'true');
                    const startDrag = () => {
                        const dragStartEvent = new DragEvent('dragstart', {
                            bubbles: true,
                            cancelable: true,
                            view: window,
                        });
                        Object.defineProperty(dragStartEvent, 'dataTransfer', {
                            value: new DataTransfer(),
                            writable: false
                        });
                        this.dispatchEvent(dragStartEvent);
                    };
                    setTimeout(startDrag, 50);
                });
            }
        }, true);

        allPossibleChatItems.forEach((item, index) => {
            try {
                item.style.position = item.style.position || 'relative';
                item.style.cursor = 'grab';
                item.style.userSelect = 'none';
                item.removeAttribute('data-prevent-drag');
                item.setAttribute('draggable', 'true');
                item.setAttribute('data-force-draggable', 'true');

                const replaceDragHandlers = (element) => {
                    const newDragStart = (e) => {
                        // console.log(`${SCRIPT_PREFIX} [Drag Diagnostics] dragstart event triggered on element:, element);
                        e.stopImmediatePropagation();
                        const chatUrl = element.getAttribute('href');
                        const chatTitle = element.querySelector('input')?.value || element.textContent || 'Chat';
                        const dragData = {
                            type: 'chat-item',
                            url: chatUrl,
                            title: chatTitle,
                            sourceElement: element.outerHTML,
                            forceDragged: true
                        };
                        e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
                        e.dataTransfer.setData('application/t3chat-item', JSON.stringify(dragData));
                        e.dataTransfer.effectAllowed = 'copy';
                        element.style.opacity = '0.7';
                        const dragImage = element.cloneNode(true);
                        dragImage.style.width = `${element.offsetWidth}px`;
                        dragImage.style.height = `${element.offsetHeight}px`;
                        dragImage.style.background = 'rgba(255, 255, 255, 0.5)'; // More transparent background
                        dragImage.style.borderRadius = '8px';
                        dragImage.style.boxShadow = '0px 10px 25px rgba(0, 0, 0, 0.15)'; // Finer shadow
                        dragImage.style.backdropFilter = 'blur(5px)'; // Add Gaussian blur
                        dragImage.style.webkitBackdropFilter = 'blur(5px)'; // Safari support
                        dragImage.style.opacity = '0.85'; // Overall opacity
                        dragImage.style.transform = 'scale(0.85)';
                        dragImage.style.transition = 'all 0.2s ease';

                        // Make inner text clearer
                        const textElements = dragImage.querySelectorAll('span, input, div');
                        textElements.forEach(el => {
                            if (el.textContent && el.textContent.trim().length > 0) {
                                el.style.textShadow = '0 0 1px rgba(0,0,0,0.1)';
                                el.style.fontWeight = '500';
                            }
                        });

                        document.body.appendChild(dragImage);
                        dragImage.style.position = 'absolute';
                        dragImage.style.top = '-1000px';
                        dragImage.style.left = '-1000px';
                        dragImage.id = 'force-drag-ghost';
                        e.dataTransfer.setDragImage(dragImage, 20, 20);
                        setTimeout(() => {
                            if (document.body.contains(dragImage)) {
                                document.body.removeChild(dragImage);
                            }
                        }, 300);
                        // console.log(`${SCRIPT_PREFIX} [Drag Diagnostics] Successfully set drag data, URL: ${chatUrl});
                        return true;
                    };

                    const oldListeners = getEventListeners(element); // Note: getEventListeners only works in developer tools
                    if (oldListeners && oldListeners.dragstart) {
                        oldListeners.dragstart.forEach(listener => {
                            element.removeEventListener('dragstart', listener.listener);
                            // console.log(`${SCRIPT_PREFIX} [Drag Diagnostics] Removed original dragstart listener);
                        });
                    }
                    element.addEventListener('dragstart', newDragStart, true);
                    element.addEventListener('dragend', (e) => {
                        element.style.opacity = '';
                        // console.log(`${SCRIPT_PREFIX} [Drag Diagnostics] Drag end);
                    }, true);
                };
                replaceDragHandlers(item);
            } catch (error) {
                console.error(`${SCRIPT_PREFIX} [Drag Diagnostics] Error processing element #${index}:`, error);
            }
        });

        const projectContainers = document.querySelectorAll('a[data-project-id]');
        projectContainers.forEach((container, index) => {
            try {
                const oldListeners = getEventListeners(container); // Note: getEventListeners only works in developer tools
                ['dragover', 'dragenter', 'dragleave', 'drop'].forEach(eventType => {
                    if (oldListeners && oldListeners[eventType]) {
                        oldListeners[eventType].forEach(listener => {
                            container.removeEventListener(eventType, listener.listener);
                        });
                    }
                });

                container.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                    container.style.background = 'rgba(59, 130, 246, 0.15)';
                    container.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
                }, true);
                container.addEventListener('dragenter', (e) => {
                    e.preventDefault();
                    // console.log(`${SCRIPT_PREFIX} [Drag Diagnostics] Drag entered project container:, container);
                }, true);
                container.addEventListener('dragleave', (e) => {
                    container.style.background = '';
                    container.style.boxShadow = '';
                }, true);
                container.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    container.style.background = '';
                    container.style.boxShadow = '';
                    // console.log(`${SCRIPT_PREFIX} [Drag Diagnostics] Dropped on project container:, container);
                    try {
                        const dataString = e.dataTransfer.getData('application/t3chat-item') || e.dataTransfer.getData('text/plain');
                        if (!dataString) {
                            console.error(`${SCRIPT_PREFIX} [Drag Diagnostics] Could not get drag data`);
                            return;
                        }
                        const dragData = JSON.parse(dataString);
                        // console.log(`${SCRIPT_PREFIX} [Drag Diagnostics] Successfully parsed drag data:, dragData);
                        if (dragData.type === 'chat-item') {
                            const projectId = container.getAttribute('data-project-id');
                            if (projectId) {
                                // console.log(`${SCRIPT_PREFIX} [Drag Diagnostics] Adding chat "${dragData.title}" to project ${projectId});
                                addChatToProject(dragData, projectId); // Ensure addChatToProject is defined
                                toggleProjectContent(projectId); // Ensure content is displayed
                                // console.log(`${SCRIPT_PREFIX} [Drag Diagnostics] Added successfully);
                            }
                        }
                    } catch (error) {
                        console.error(`${SCRIPT_PREFIX} [Drag Diagnostics] Error processing drop data:`, error);
                    }
                }, true);

                container.setAttribute('data-force-droppable', 'true');
            } catch (error) {
                console.error(`${SCRIPT_PREFIX} [Drag Diagnostics] Error processing project container #${index}:`, error);
            }
        });
        console.log(`${SCRIPT_PREFIX} ===== Drag Diagnostics and Force Override Complete =====`);
    };

    const getEventListeners = (element) => {
        // Mock function, actual effect depends on browser developer tools
        return {};
    };

    const setupDragAndDrop = () => {
        try {
            console.log(`${SCRIPT_PREFIX} Starting to set up drag and drop functionality...`);

            // Add CSS styles to prevent accidental text selection
            if (!document.querySelector('#project-text-selection-style')) {
                const style = document.createElement('style');
                style.id = 'project-text-selection-style';
                style.textContent = `
                    a[data-project-id] {
                        -webkit-user-select: none !important;
                        -moz-user-select: none !important;
                        -ms-user-select: none !important;
                        user-select: none !important;
                    }

                    a[data-project-id] input[readonly] {
                        -webkit-user-select: none !important;
                        -moz-user-select: none !important;
                        -ms-user-select: none !important;
                        user-select: none !important;
                    }

                    .triangle-icon {
                        -webkit-user-select: none !important;
                        -moz-user-select: none !important;
                        -ms-user-select: none !important;
                        user-select: none !important;
                    }
                `;
                document.head.appendChild(style);
            }

            makeChatsItemsDraggable();
            makeProjectContainersDroppable(); // Will now call the function defined inside the IIFE
            observeDOMForDragAndDrop();
            setupGlobalDragEffects();
            setTimeout(enableDragDiagnostics, 2000);
            console.log(`${SCRIPT_PREFIX} Drag and drop functionality setup complete`);
            setTimeout(() => {
                makeChatsItemsDraggable();
                makeProjectContainersDroppable();
                enableDragDiagnostics();
            }, 3000);
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Error setting up drag and drop functionality:`, error);
        }
    };

    // Set up global drag effects, highlight all Project containers during drag
    const setupGlobalDragEffects = () => {
        try {
            // Remove Gaussian blur feature, only keep container highlighting

            // Listen for global drag events
            document.addEventListener('dragstart', handleGlobalDragStart, true);
            document.addEventListener('dragend', handleGlobalDragEnd, true);
            document.addEventListener('drop', handleGlobalDragEnd, true);
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Error setting up global drag effects:`, error);
        }
    };

    // Handle global drag start event
    const handleGlobalDragStart = (e) => {
        try {
            const chatItem = e.target.closest('a[href^="/chat/"]');
            if (!chatItem) return;

            // Highlight all Project containers
            const projectContainers = document.querySelectorAll('a[data-project-id]');
            projectContainers.forEach(container => {
                // Add highlight effect to make it more noticeable
                container.style.transition = 'all 0.2s ease-in-out';
                container.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.6), 0 4px 12px rgba(59, 130, 246, 0.3)';
                container.style.background = 'rgba(59, 130, 246, 0.15)';
                container.style.zIndex = '1000';
                container.style.position = 'relative';

                // Add slight zoom effect to Project containers to make them easier to click
                container.style.transform = 'scale(1.03)';

                // Highlight Project icon
                const folderIcon = container.querySelector('svg.lucide-folder');
                if (folderIcon) {
                    folderIcon.style.color = '#3b82f6';
                    folderIcon.style.transition = 'all 0.2s ease-in-out';
                    folderIcon.style.transform = 'scale(1.2)';
                }
            });
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Error handling global drag start event:`, error);
        }
    };

    // Handle global drag end event
    const handleGlobalDragEnd = (e) => {
        try {
            // Reset styles for all Project containers
            const projectContainers = document.querySelectorAll('a[data-project-id]');
            projectContainers.forEach(container => {
                container.style.boxShadow = '';
                container.style.background = '';
                container.style.transform = '';

                // Reset Project icon
                const folderIcon = container.querySelector('svg.lucide-folder');
                if (folderIcon) {
                    folderIcon.style.color = '';
                    folderIcon.style.transform = '';
                }
            });
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Error handling global drag end event:`, error);
        }
    };

    const makeChatsItemsDraggable = () => {
        const chatItems = document.querySelectorAll('a[href^="/chat/"]:not([data-project-id])');
        chatItems.forEach(item => {
            item.setAttribute('draggable', 'true');
            item.style.cursor = 'grab';
            if (!item.hasAttribute('data-made-draggable')) {
                item.setAttribute('data-made-draggable', 'true');
                item.removeEventListener('dragstart', handleDragStart);
                item.removeEventListener('dragend', handleDragEnd);
                item.addEventListener('dragstart', handleDragStart, { capture: true });
                item.addEventListener('dragend', handleDragEnd, { capture: true });
                item.addEventListener('mousedown', (e) => {
                    item.setAttribute('data-drag-ready', 'true');
                    const originalDraggable = item.draggable;
                    item.draggable = true;
                    const mouseMoveHandler = (moveEvent) => {
                        if (Math.abs(moveEvent.clientX - e.clientX) > 5 || Math.abs(moveEvent.clientY - e.clientY) > 5) {
                            document.removeEventListener('mousemove', mouseMoveHandler);
                            document.removeEventListener('mouseup', mouseUpHandler);
                            if (item.getAttribute('data-drag-started') !== 'true') {
                                // console.log(`${SCRIPT_PREFIX} [Enhanced Drag] Manually triggering drag start);
                                const dragStartEvent = new DragEvent('dragstart', {
                                    bubbles: true,
                                    cancelable: true,
                                    dataTransfer: new DataTransfer()
                                });
                                item.setAttribute('data-manual-drag', 'true');
                                item.dispatchEvent(dragStartEvent);
                            }
                        }
                    };
                    const mouseUpHandler = () => {
                        document.removeEventListener('mousemove', mouseMoveHandler);
                        document.removeEventListener('mouseup', mouseUpHandler);
                        item.removeAttribute('data-drag-ready');
                        item.draggable = originalDraggable;
                    };
                    document.addEventListener('mousemove', mouseMoveHandler);
                    document.addEventListener('mouseup', mouseUpHandler);
                });
                item.addEventListener('mouseenter', () => {
                    if (!item.querySelector('.drag-handle')) {
                        const dragHandle = document.createElement('div');
                        dragHandle.className = 'drag-handle';
                        dragHandle.style.position = 'absolute';
                        dragHandle.style.left = '2px';
                        dragHandle.style.top = '50%';
                        dragHandle.style.transform = 'translateY(-50%)';
                        dragHandle.style.width = '6px';
                        dragHandle.style.height = '10px';
                        dragHandle.style.background = 'currentColor';
                        dragHandle.style.opacity = '0.3';
                        dragHandle.style.borderRadius = '2px';
                        dragHandle.innerHTML = '⋮⋮';
                        dragHandle.style.fontSize = '8px';
                        dragHandle.style.lineHeight = '10px';
                        dragHandle.style.pointerEvents = 'none';
                        const innerDiv = item.querySelector('div');
                        if (innerDiv) {
                            innerDiv.style.paddingLeft = '12px';
                            innerDiv.insertBefore(dragHandle, innerDiv.firstChild);
                        }
                    }
                });
                item.addEventListener('mouseleave', () => {
                    const dragHandle = item.querySelector('.drag-handle');
                    if (dragHandle) {
                        dragHandle.remove();
                        const innerDiv = item.querySelector('div');
                        if (innerDiv) {
                            innerDiv.style.paddingLeft = '';
                        }
                    }
                });
            }
        });
        // console.log(`${SCRIPT_PREFIX} Processed ${chatItems.length} chat items for draggable setup);
    };

    const handleDragStart = (event) => {
        try {
            // console.log(`${SCRIPT_PREFIX} Drag start, event.currentTarget);
            event.currentTarget.setAttribute('data-drag-started', 'true');
            const chatUrl = event.currentTarget.getAttribute('href');
            const chatTitle = event.currentTarget.querySelector('input')?.value || 'Chat';
            const sourceElement = event.currentTarget.outerHTML;
            const dragData = {
                type: 'chat-item',
                url: chatUrl,
                title: chatTitle,
                sourceElement: sourceElement
            };
            // console.log(`${SCRIPT_PREFIX} Drag data:, JSON.stringify(dragData).substring(0, 100) + '...');
            event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
            event.dataTransfer.setData('application/t3chat-item', JSON.stringify(dragData));
            event.dataTransfer.effectAllowed = 'copy';
            event.currentTarget.style.opacity = '0.7';
            event.currentTarget.classList.add('being-dragged');
            const dragImage = event.currentTarget.cloneNode(true);
            dragImage.style.width = `${event.currentTarget.offsetWidth}px`;
            dragImage.style.height = `${event.currentTarget.offsetHeight}px`;
            dragImage.style.background = 'rgba(255, 255, 255, 0.5)'; // More transparent background
            dragImage.style.borderRadius = '8px';
            dragImage.style.overflow = 'hidden';
            dragImage.style.transform = 'scale(0.85)';
            dragImage.style.pointerEvents = 'none';
            dragImage.style.boxShadow = '0px 10px 25px rgba(0, 0, 0, 0.15)'; // Finer shadow
            dragImage.style.zIndex = '9999';
            dragImage.style.backdropFilter = 'blur(5px)'; // Add Gaussian blur
            dragImage.style.webkitBackdropFilter = 'blur(5px)'; // Safari support
            dragImage.style.transition = 'all 0.2s ease';
            dragImage.style.opacity = '0.85'; // Overall opacity

            // Make inner text clearer
            const textElements = dragImage.querySelectorAll('span, input, div');
            textElements.forEach(el => {
                if (el.textContent && el.textContent.trim().length > 0) {
                    el.style.textShadow = '0 0 1px rgba(0,0,0,0.1)';
                    el.style.fontWeight = '500';
                }
            });

            document.body.appendChild(dragImage);
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-1000px';
            dragImage.style.left = '-1000px';
            dragImage.id = 'drag-ghost-image';
            event.dataTransfer.setDragImage(dragImage, 20, 20);
            setTimeout(() => {
                if (document.body.contains(dragImage)) {
                    document.body.removeChild(dragImage);
                }
                event.currentTarget.removeAttribute('data-drag-started');
                event.currentTarget.removeAttribute('data-manual-drag');
            }, 300);
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Drag start error:`, error);
        }
    };

    const handleDragEnd = (event) => {
        try {
            event.currentTarget.style.opacity = '';
            event.currentTarget.classList.remove('being-dragged');
            document.querySelectorAll('.drag-over').forEach(el => {
                el.classList.remove('drag-over');
                el.style.background = '';
                el.style.boxShadow = '';
            });
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Drag end error:`, error);
        }
    };

    const handleDragOver = function(event) {
        try {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';

            // Ensure the entire Project container has clear visual feedback
            if (!this.classList.contains('drag-over')) {
                handleDragEnter.call(this, event);
            }
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Drag over target error:`, error);
        }
    };

    const handleDragEnter = function(event) {
        try {
            this.classList.add('drag-over');
            this.style.background = 'rgba(59, 130, 246, 0.2)';
            this.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.6), 0 4px 12px rgba(59, 130, 246, 0.3)';
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'all 0.15s ease-in-out';

            // Add insertion indicator animation
            const indicator = this.querySelector('.drag-drop-indicator');
            if (indicator) {
                indicator.style.display = 'block';
                indicator.style.animation = 'pulse 1s infinite';
                indicator.style.opacity = '1';
            }

            // Add animation effect to icons inside the container
            const folderIcon = this.querySelector('svg.lucide-folder');
            if (folderIcon) {
                folderIcon.style.transform = 'scale(1.1)';
                folderIcon.style.transition = 'transform 0.15s ease-in-out';
                folderIcon.style.color = '#3b82f6';
            }

            // Add pulse animation
            if (!document.querySelector('#project-hover-animation')) {
                const styleSheet = document.createElement('style');
                styleSheet.id = 'project-hover-animation';
                styleSheet.textContent = `
                    @keyframes pulse {
                        0% { opacity: 0.6; }
                        50% { opacity: 1; }
                        100% { opacity: 0.6; }
                    }
                `;
                document.head.appendChild(styleSheet);
            }
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Drag enter target error:`, error);
        }
    };

    const handleDragLeave = function(event) {
        try {
            // Check if really left the entire element area, not just entered a child element
            const rect = this.getBoundingClientRect();
            if (event.clientX < rect.left || event.clientX > rect.right ||
                event.clientY < rect.top || event.clientY > rect.bottom) {

                this.classList.remove('drag-over');
                this.style.background = '';
                this.style.boxShadow = '';
                this.style.transform = '';

                // Reset drag-drop indicator
                const indicator = this.querySelector('.drag-drop-indicator');
                if (indicator) {
                    indicator.style.animation = '';
                    indicator.style.opacity = '0.6';
                    indicator.style.display = 'none';
                }

                // Restore icon style
                const folderIcon = this.querySelector('svg.lucide-folder');
                if (folderIcon) {
                    folderIcon.style.transform = '';
                    folderIcon.style.color = '';
                }
            }
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Drag leave target error:`, error);
        }
    };

    const handleDrop = function(event) {
        try {
            event.preventDefault();
            event.currentTarget.classList.remove('drag-over');
            event.currentTarget.style.background = '';
            event.currentTarget.style.boxShadow = '';
            let dragData;
            try {
                const dataString = event.dataTransfer.getData('application/t3chat-item') || event.dataTransfer.getData('text/plain');
                dragData = JSON.parse(dataString);
                // console.log(`${SCRIPT_PREFIX} Successfully got drag data:, dragData.type, dragData.url);
            } catch (parseError) {
                console.error(`${SCRIPT_PREFIX} Failed to parse drag data:`, parseError);
                return;
            }
            if (dragData.type === 'chat-item') {
                const projectId = event.currentTarget.getAttribute('data-project-id');
                if (projectId) {
                    // console.log(`${SCRIPT_PREFIX} Trying to add chat ${dragData.title} to project ${projectId}`);
                    addChatToProject(dragData, projectId);
                    // Ensure project content is expanded and displayed
                    toggleProjectContent(projectId);
                    // console.log(`${SCRIPT_PREFIX} [Drag Diagnostics] Added successfully);
                }
            }
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Drop error:`, error);
        }
    };

    // ***Correction: Define makeProjectContainersDroppable function***
    const makeProjectContainersDroppable = () => {
        try {
            console.log(`${SCRIPT_PREFIX} ===== Starting to reset drag and drop functionality for all projects =====`);

            // Get all project containers
            const projectContainers = document.querySelectorAll('a[data-project-id]');
            console.log(`${SCRIPT_PREFIX} Found ${projectContainers.length} project containers`);

            projectContainers.forEach((container, index) => {
                const projectId = container.getAttribute('data-project-id');
                console.log(`${SCRIPT_PREFIX} Setting up drag and drop for project ${projectId} (index: ${index})`);

                // Remove all existing drag-drop helper elements, force re-creation
                const existingHelper = container.querySelector('.drop-helper-zone');
                if (existingHelper) {
                    existingHelper.remove();
                }

                const existingIndicator = container.querySelector('.drag-drop-indicator');
                if (existingIndicator) {
                    existingIndicator.remove();
                }

                // Clean up previously existing event listeners
                if (container._cleanupDragEvents) {
                    container._cleanupDragEvents();
                }

                // Set necessary styles
                container.style.position = 'relative';

                // Create or update drag-drop helper zone
                let dropHelper = container.querySelector('.drop-helper-zone');
                if (dropHelper) {
                    dropHelper.remove();
                }

                dropHelper = document.createElement('div');
                dropHelper.className = 'drop-helper-zone';
                dropHelper.style.cssText = `
                    position: absolute;
                    top: -20px;
                    left: -20px;
                    right: -20px;
                    bottom: ${container.hasAttribute('data-pinned') ? '0px' : '-20px'};
                    z-index: 10;
                    pointer-events: none;
                `;

                container.appendChild(dropHelper);

                // Create unified event handlers
                const dragOverHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'copy';

                    container.classList.add('drag-over');
                    container.style.background = 'rgba(59, 130, 246, 0.2)';
                    container.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.6)';
                    container.style.transform = 'scale(1.02)';
                    container.style.transition = 'all 0.15s ease-in-out';

                    const folderIcon = container.querySelector('svg.lucide-folder');
                    if (folderIcon) {
                        folderIcon.style.color = '#3b82f6';
                        folderIcon.style.transform = 'scale(1.1)';
                    }
                };

                const dragEnterHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`${SCRIPT_PREFIX} Drag entered project ${projectId}`);
                };

                const dragLeaveHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // Check if truly left the container area
                    const rect = container.getBoundingClientRect();
                    if (e.clientX < rect.left || e.clientX > rect.right ||
                        e.clientY < rect.top || e.clientY > rect.bottom) {

                        container.classList.remove('drag-over');
                        container.style.background = '';
                        container.style.boxShadow = '';
                        container.style.transform = '';

                        const folderIcon = container.querySelector('svg.lucide-folder');
                        if (folderIcon) {
                            folderIcon.style.color = '';
                            folderIcon.style.transform = '';
                        }
                    }
                };

                const dropHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    console.log(`${SCRIPT_PREFIX} Dropped onto project ${projectId}`);

                    // Reset styles
                    container.classList.remove('drag-over');
                    container.style.background = '';
                    container.style.boxShadow = '';
                    container.style.transform = '';

                    const folderIcon = container.querySelector('svg.lucide-folder');
                    if (folderIcon) {
                        folderIcon.style.color = '';
                        folderIcon.style.transform = '';
                    }

                    try {
                        const dataString = e.dataTransfer.getData('application/t3chat-item') ||
                                         e.dataTransfer.getData('text/plain');

                        if (!dataString) {
                            console.error(`${SCRIPT_PREFIX} Project ${projectId} could not get drag data`);
                            return;
                        }

                        const dragData = JSON.parse(dataString);
                        console.log(`${SCRIPT_PREFIX} Project ${projectId} successfully parsed drag data:`, dragData);

                        if (dragData.type === 'chat-item') {
                            console.log(`${SCRIPT_PREFIX} Adding chat "${dragData.title}" to project ${projectId}`);

                            // Add chat to project
                            addChatToProject(dragData, projectId);

                            // Important: Ensure project is expanded and content is displayed
                            setTimeout(() => {
                                console.log(`${SCRIPT_PREFIX} Attempting to expand project ${projectId}`);
                                toggleProjectContent(projectId);

                                // Re-ensure UI update
                                setTimeout(() => {
                                    updateProjectUI(projectId);
                                    console.log(`${SCRIPT_PREFIX} Project ${projectId} UI update complete`);
                                }, 100);
                            }, 50);
                        }
                    } catch (error) {
                        console.error(`${SCRIPT_PREFIX} Project ${projectId} error processing drag data:`, error);
                    }
                };

                // Add event listeners to container and helper zone
                container.addEventListener('dragover', dragOverHandler);
                container.addEventListener('dragenter', dragEnterHandler);
                container.addEventListener('dragleave', dragLeaveHandler);
                container.addEventListener('drop', dropHandler);

                // Also add event listeners to the helper zone
                dropHelper.style.pointerEvents = 'auto';
                dropHelper.addEventListener('dragover', dragOverHandler);
                dropHelper.addEventListener('dragenter', dragEnterHandler);
                dropHelper.addEventListener('dragleave', dragLeaveHandler);
                dropHelper.addEventListener('drop', dropHandler);

                // Create cleanup function to clear event listeners on next reset
                container._cleanupDragEvents = () => {
                    container.removeEventListener('dragover', dragOverHandler);
                    container.removeEventListener('dragenter', dragEnterHandler);
                    container.removeEventListener('dragleave', dragLeaveHandler);
                    container.removeEventListener('drop', dropHandler);

                    const helper = container.querySelector('.drop-helper-zone');
                    if (helper) {
                        helper.removeEventListener('dragover', dragOverHandler);
                        helper.removeEventListener('dragenter', dragEnterHandler);
                        helper.removeEventListener('dragleave', dragLeaveHandler);
                        helper.removeEventListener('drop', dropHandler);
                    }

                    console.log(`${SCRIPT_PREFIX} Cleaned up drag and drop event listeners for project ${projectId}`);
                };

                // Add visual indicator
                let dragIndicator = container.querySelector('.drag-drop-indicator');
                if (dragIndicator) {
                    dragIndicator.remove();
                }

                dragIndicator = document.createElement('div');
                dragIndicator.className = 'drag-drop-indicator';
                dragIndicator.style.cssText = `
                    position: absolute;
                    right: 35px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 16px;
                    height: 16px;
                    opacity: 0.6;
                    pointer-events: none;
                    display: none;
                `;
                dragIndicator.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                        <path d="M18 17v-2a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2"></path>
                        <path d="M18 17v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2"></path>
                        <path d="M9 17V9a2 2 0 0 1 2-2h1"></path>
                    </svg>
                `;

                const innerDiv = container.querySelector('.relative.flex.w-full.items-center');
                if (innerDiv) {
                    innerDiv.appendChild(dragIndicator);

                    // Show indicator on mouse hover
                    container.addEventListener('mouseenter', () => {
                        const indicator = container.querySelector('.drag-drop-indicator');
                        if (indicator) indicator.style.display = 'block';
                    });

                    container.addEventListener('mouseleave', () => {
                        const indicator = container.querySelector('.drag-drop-indicator');
                        if (indicator) indicator.style.display = 'none';
                    });
                }

                // Mark as set up
                container._dragHandlersAttached = true;
                console.log(`${SCRIPT_PREFIX} Project ${projectId} drag and drop functionality setup complete`);
            });

            console.log(`${SCRIPT_PREFIX} ===== All project drag and drop functionality setup complete =====`);
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} makeProjectContainersDroppable error:`, error);
        }
    };


    const addChatToProject = (chatData, projectId) => {
        try {
            const projects = loadProjectsFromStorage();
            const projectIndex = projects.findIndex(p => p.id === projectId);
            if (projectIndex >= 0) {
                if (!projects[projectIndex].chats) {
                    projects[projectIndex].chats = [];
                }
                const existingChatIndex = projects[projectIndex].chats.findIndex(c => c.url === chatData.url);
                if (existingChatIndex < 0) {
                    projects[projectIndex].chats.push({
                        url: chatData.url,
                        title: chatData.title,
                        addedAt: Date.now(),
                        sourceElement: chatData.sourceElement
                    });
                    saveProjectsToStorage(projects);
                    updateProjectUI(projectId); // Ensure updateProjectUI is defined
                    // console.log(`${SCRIPT_PREFIX} Successfully added chat "${chatData.title}" to project);
                } else {
                    // console.log(`${SCRIPT_PREFIX} This chat already exists in the project);
                }
            }
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Error adding chat to project:`, error);
        }
    };

    const observeDOMForDragAndDrop = () => {
        const observer = new MutationObserver((mutations) => {
            let needsUpdate = false;
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) {
                            if (node.matches && (node.matches('a[href^="/chat/"]') || node.querySelector('a[href^="/chat/"]'))) {
                                needsUpdate = true;
                                break;
                            }
                        }
                    }
                }
            }
            if (needsUpdate) {
                // console.log(`${SCRIPT_PREFIX} DOM change detected, resetting drag and drop functionality);
                makeChatsItemsDraggable();
                makeProjectContainersDroppable();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        // console.log(`${SCRIPT_PREFIX} DOM observer started to monitor drag element changes);
    };

    const showSuccessToast = (message) => { console.log(`${SCRIPT_PREFIX} Success: ${message}`); };
    const showErrorToast = (message) => { console.error(`${SCRIPT_PREFIX} Error: ${message}`); };
    const showInfoToast = (message) => { console.log(`${SCRIPT_PREFIX} Info: ${message}`); };
    const showToast = (message, type = 'info') => { console.log(`${SCRIPT_PREFIX} ${type}: ${message}`); };

    // Add function to manage chat highlight state
    const manageChatHighlighting = (activeUrl) => {
        try {
            // Remove highlight state from all chat items (including Project chat items and regular chat items)
            const allChatItems = document.querySelectorAll('a[href^="/chat/"]:not([data-project-id])');
            const allProjectChatItems = document.querySelectorAll('a[data-project-chat-id]');

            // Reset highlight for regular chat items
            allChatItems.forEach(item => {
                item.classList.remove('bg-sidebar-accent', 'text-sidebar-accent-foreground');
                item.classList.add('text-muted-foreground');
            });

            // Reset highlight for Project chat items
            allProjectChatItems.forEach(item => {
                item.classList.remove('bg-sidebar-accent', 'text-sidebar-accent-foreground');
                item.classList.add('text-muted-foreground');
            });

            // If activeUrl is provided, highlight the corresponding item
            if (activeUrl) {
                // Highlight regular chat item
                const activeChatItem = document.querySelector(`a[href="${activeUrl}"]:not([data-project-chat-id])`);
                if (activeChatItem) {
                    activeChatItem.classList.add('bg-sidebar-accent', 'text-sidebar-accent-foreground');
                    activeChatItem.classList.remove('text-muted-foreground');
                }

                // Highlight corresponding Project chat item
                const activeProjectChatItem = document.querySelector(`a[href="${activeUrl}"][data-project-chat-id]`);
                if (activeProjectChatItem) {
                    activeProjectChatItem.classList.add('bg-sidebar-accent', 'text-sidebar-accent-foreground');
                    activeProjectChatItem.classList.remove('text-muted-foreground');
                }
            }

            console.log(`${SCRIPT_PREFIX} Chat highlight state updated: ${activeUrl || 'None'}`);
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Error managing chat highlight state:`, error);
        }
    };

    const updateProjectUI = (projectId) => {
        try {
            const projectContainer = document.querySelector(`a[data-project-id="${projectId}"]`);
            if (!projectContainer) return;
            let projectContent = document.querySelector(`div[data-project-content="${projectId}"]`);
            if (!projectContent) {
                projectContent = document.createElement('div');
                projectContent.setAttribute('data-project-content', projectId);
                projectContent.className = 'pl-4 mt-1 space-y-1 project-content';
                if (projectContainer.nextSibling) {
                    projectContainer.parentNode.insertBefore(projectContent, projectContainer.nextSibling);
                } else {
                    projectContainer.parentNode.appendChild(projectContent);
                }
            }
            const projects = loadProjectsFromStorage();
            const project = projects.find(p => p.id === projectId);
            if (project && project.chats && project.chats.length > 0) {
                projectContent.innerHTML = '';
                project.chats.forEach(chat => {
                    if (chat.sourceElement) {
                        const tempContainer = document.createElement('div');
                        tempContainer.innerHTML = chat.sourceElement;
                        let chatItem = tempContainer.firstChild;
                        if (chatItem && chatItem.nodeType === 1) { // Ensure it's an element
                            chatItem = tempContainer.querySelector('a') || chatItem; // Prefer the 'a' tag if present
                            chatItem.setAttribute('data-project-chat-id', `${projectId}-${chat.url}`);
                            chatItem.href = chat.url;
                            chatItem.classList.add('project-chat-item');
                            chatItem.style.paddingLeft = '24px'; // Increased indent for better visual hierarchy

                            // Prevent page refresh on click - enhance SPA navigation
                            chatItem.addEventListener('click', (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Note: Do not use stopImmediatePropagation, allow event to bubble normally

                                // Check if this is a programmatic click
                                if (chatItem.hasAttribute('data-programmatic-click')) {
                                    chatItem.removeAttribute('data-programmatic-click');
                                    return false;
                                }

                                // SPA navigation to chat URL
                                const chatUrl = chatItem.getAttribute('href');
                                if (chatUrl) {
                                    console.log(`${SCRIPT_PREFIX} SPA navigation to Project chat: ${chatUrl}`);

                                    // Immediately update highlight state
                                    manageChatHighlighting(chatUrl);

                                    // Try to find the corresponding chat item in the sidebar and click it
                                    const sidebarChatLink = document.querySelector(`a[href="${chatUrl}"]:not([data-project-chat-id])`);
                                    if (sidebarChatLink) {
                                        // Mark as programmatic click to avoid reprocessing
                                        sidebarChatLink.setAttribute('data-programmatic-click', 'true');
                                        sidebarChatLink.click();
                                    } else {
                                        // Use History API for navigation
                                        history.pushState({}, '', chatUrl);
                                        window.dispatchEvent(new PopStateEvent('popstate', { bubbles: true, cancelable: true, state: {} }));

                                        // Re-ensure highlight state is correct
                                        setTimeout(() => {
                                            manageChatHighlighting(chatUrl);
                                        }, 100);
                                    }
                                }

                                return false;
                            }, true);

                            // Prevent other mouse events from triggering navigation
                            chatItem.addEventListener('mousedown', (e) => e.preventDefault(), true);
                            chatItem.addEventListener('mouseup', (e) => e.preventDefault(), true);

                            const actionDiv = chatItem.querySelector('.pointer-events-auto');
                            if (actionDiv) {
                                actionDiv.innerHTML = `
                                    <div class="pointer-events-none absolute bottom-0 right-[100%] top-0 h-12 w-8 bg-gradient-to-l from-sidebar-accent to-transparent opacity-0 group-hover/link:opacity-100"></div>
                                    <button class="rounded-md p-1.5 hover:bg-destructive/50 hover:text-destructive-foreground remove-chat-btn" tabindex="-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x">
                                            <path d="M18 6 6 18"></path>
                                            <path d="m6 6 12 12"></path>
                                        </svg>
                                    </button>
                                `;
                                const removeBtn = actionDiv.querySelector('.remove-chat-btn');
                                if (removeBtn) {
                                    removeBtn.addEventListener('click', (event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        removeChatFromProject(chat.url, projectId);
                                        chatItem.remove();
                                        if (projectContent.children.length === 0) {
                                            projectContent.style.display = 'none';
                                        } else {
                                            // Recalculate height after removal
                                            updateProjectContentHeight(projectContent, projectContent.children.length);
                                        }
                                    });
                                }
                            }
                            // Dynamic title update to reflect stored chat.title
                            const displayTitle = chat.title;
                            const inputElem = chatItem.querySelector('input');
                            if (inputElem) {
                                inputElem.value = displayTitle;
                                inputElem.title = displayTitle;
                            } else {
                                const spanElem = chatItem.querySelector('span.truncate');
                                if (spanElem) spanElem.textContent = displayTitle;
                            }

                            // Important: Add chatItem to projectContent
                            projectContent.appendChild(chatItem);
                        }
                    } else {
                        const chatItem = document.createElement('a');
                        chatItem.href = chat.url;
                        chatItem.className = 'flex items-center rounded-md p-1.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground project-chat-item';
                        chatItem.setAttribute('data-project-chat-id', `${projectId}-${chat.url}`);
                        chatItem.style.position = 'relative';
                        chatItem.style.paddingLeft = '24px'; // Increased indent for better visual hierarchy

                        // Prevent page refresh on click
                        chatItem.addEventListener('click', (e) => {
                            e.preventDefault();

                            // Check if this is a programmatic click
                            if (chatItem.hasAttribute('data-programmatic-click')) {
                                chatItem.removeAttribute('data-programmatic-click');
                                return;
                            }

                            // Navigate directly to chat URL
                            const chatUrl = chatItem.getAttribute('href');
                            if (chatUrl) {
                                console.log(`${SCRIPT_PREFIX} Navigating to Project chat: ${chatUrl}`);

                                // Immediately update highlight state
                                manageChatHighlighting(chatUrl);

                                // Try to find the corresponding chat item in the sidebar and click it
                                const sidebarChatLink = document.querySelector(`a[href="${chatUrl}"]:not([data-project-chat-id])`);
                                if (sidebarChatLink) {
                                    // Mark as programmatic click to avoid reprocessing
                                    sidebarChatLink.setAttribute('data-programmatic-click', 'true');
                                    sidebarChatLink.click();
                                } else {
                                    // Use direct navigation instead of History API
                                    window.location.href = chatUrl;
                                }
                            }
                        });

                        const title = document.createElement('span');
                        title.className = 'truncate';
                        title.textContent = chat.title;
                        chatItem.appendChild(title);
                        const removeBtn = document.createElement('button');
                        removeBtn.className = 'absolute right-1 opacity-0 hover:opacity-100 group-hover:opacity-100 rounded-full hover:bg-muted/50 p-0.5';
                        removeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';
                        removeBtn.addEventListener('click', (event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            removeChatFromProject(chat.url, projectId);
                            chatItem.remove();
                            if (projectContent.children.length === 0) {
                                projectContent.style.display = 'none';
                            } else {
                                // Recalculate height after removal
                                updateProjectContentHeight(projectContent, projectContent.children.length);
                            }
                        });
                        chatItem.appendChild(removeBtn);
                        chatItem.addEventListener('mouseenter', () => { removeBtn.style.opacity = '1'; });
                        chatItem.addEventListener('mouseleave', () => { removeBtn.style.opacity = '0'; });
                        projectContent.appendChild(chatItem);
                    }
                });
                projectContent.style.display = 'block';
                updateProjectContentHeight(projectContent, project.chats.length);
            } else {
                projectContent.style.display = 'none';
                // Persist any updated titles
                saveProjectsToStorage(projects);
            }
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Error updating project UI:`, error);
        }
    };

    // Helper function to update project content height
    const updateProjectContentHeight = (projectContent, chatCount) => {
        if (chatCount > 0) {
            projectContent.style.minHeight = `${Math.min(chatCount * 40, 300)}px`;
            if (chatCount > 7) {
                projectContent.style.maxHeight = '300px';
                projectContent.style.overflowY = 'auto';
            } else {
                projectContent.style.maxHeight = '';
                projectContent.style.overflowY = '';
            }
        } else {
            projectContent.style.minHeight = '0';
            projectContent.style.display = 'none';
        }
    };

    const removeChatFromProject = (chatUrl, projectId) => {
        try {
            const projects = loadProjectsFromStorage();
            const projectIndex = projects.findIndex(p => p.id === projectId);
            if (projectIndex >= 0 && projects[projectIndex].chats) {
                projects[projectIndex].chats = projects[projectIndex].chats.filter(chat => chat.url !== chatUrl);
                saveProjectsToStorage(projects);

                // Update the project content height after removal
                const projectContent = document.querySelector(`div[data-project-content="${projectId}"]`);
                if (projectContent) {
                    if (projects[projectIndex].chats.length === 0) {
                        projectContent.style.display = 'none';
                    } else {
                        updateProjectContentHeight(projectContent, projects[projectIndex].chats.length);
                    }
                }

                showSuccessToast('Chat removed from project');
            }
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Error removing chat from project:`, error);
            showErrorToast('Failed to remove chat');
        }
    };

    const createProjectItem = (projectData, contentSidebar) => {
        try {
            if (!contentSidebar || !projectData) {
                console.warn(`${SCRIPT_PREFIX} Invalid project data or sidebar`);
                return null;
            }
            const threadLink = document.createElement('a');
            threadLink.className = 'group/link relative flex h-9 w-full items-center overflow-hidden rounded-lg px-2 py-1 text-sm outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring hover:focus-visible:bg-sidebar-accent bg-sidebar-accent text-sidebar-accent-foreground';
            threadLink.removeAttribute('href');
            threadLink.setAttribute('data-discover', 'true');
            threadLink.setAttribute('data-project-id', projectData.id);
            if (projectData.isPinned) {
                threadLink.setAttribute('data-pinned', 'true');
            }
            threadLink.style.width = 'auto';
            threadLink.style.flex = '1 1 auto';
            threadLink.style.cursor = 'pointer';
            threadLink.style.userSelect = 'none'; // Prevent text selection
            threadLink.addEventListener('click', (event) => {
                // Check if the click came from the triangle icon
                if (event.target.closest('.triangle-icon')) {
                    return; // If the triangle icon was clicked, do not handle this event
                }

                event.preventDefault();
                event.stopPropagation();

                // Prevent rapid clicks from triggering rename
                const currentTime = Date.now();
                if (!threadLink._lastClickTime) {
                    threadLink._lastClickTime = currentTime;
                } else {
                    const timeDiff = currentTime - threadLink._lastClickTime;
                    threadLink._lastClickTime = currentTime;

                    // If click interval is too short, ignore this click
                    if (timeDiff < 300) {
                        return;
                    }
                }

                toggleProjectContent(projectData.id);
            });

            const innerDiv = document.createElement('div');
            innerDiv.className = 'relative flex w-full items-center';

            const triangleIcon = document.createElement('div');
            triangleIcon.className = 'triangle-icon mr-1 text-muted-foreground';
            triangleIcon.style.cssText = `
                width: 16px;
                height: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                user-select: none;
                flex-shrink: 0;
                padding: 2px;
                border-radius: 4px;
                transition: background-color 0.2s ease;
            `;
            triangleIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="8,4 16,12 8,20"></polygon></svg>';

            // Add independent click event for the triangle icon
            triangleIcon.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log(`${SCRIPT_PREFIX} Triangle icon clicked, toggling project ${projectData.id}`);
                toggleProjectContent(projectData.id);
            });

            // Add hover effect for the triangle icon
            triangleIcon.addEventListener('mouseenter', () => {
                triangleIcon.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
            });

            triangleIcon.addEventListener('mouseleave', () => {
                triangleIcon.style.backgroundColor = '';
            });

            innerDiv.appendChild(triangleIcon);

            const folderIcon = document.createElement('div');
            folderIcon.className = 'mr-2 flex-shrink-0';
            folderIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`;
            innerDiv.appendChild(folderIcon);

            const buttonContainer = document.createElement('button');
            buttonContainer.setAttribute('data-state', 'instant-open');
            buttonContainer.className = 'w-full';
            buttonContainer.setAttribute('aria-describedby', 'radix-:ro:'); // Consider unique ID if needed

            const inputContainer = document.createElement('div');
            inputContainer.className = 'relative w-full';

            const input = document.createElement('input');
            input.setAttribute('aria-label', 'Thread title');
            input.setAttribute('aria-describedby', 'thread-title-hint'); // Consider unique ID
            input.setAttribute('aria-readonly', 'true');
            input.readOnly = true;
            input.tabIndex = -1;
            input.className = 'hover:truncate-none h-full w-full rounded bg-transparent px-1 py-1 text-sm text-muted-foreground outline-none pointer-events-none cursor-pointer overflow-hidden truncate';
            input.title = projectData.title || 'Project';
            input.type = 'text';
            input.value = projectData.title || 'Project';
            input.style.userSelect = 'none'; // Prevent text selection

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'pointer-events-auto absolute -right-1 bottom-0 top-0 z-50 flex translate-x-full items-center justify-end text-muted-foreground transition-transform group-hover/link:translate-x-0 group-hover/link:bg-sidebar-accent';

            const gradientDiv = document.createElement('div');
            gradientDiv.className = 'pointer-events-none absolute bottom-0 right-[100%] top-0 h-12 w-8 bg-gradient-to-l from-sidebar-accent to-transparent opacity-0 group-hover/link:opacity-100';

            const pinButton = document.createElement('button');
            pinButton.className = 'rounded-md p-1.5 hover:bg-muted/40';
            pinButton.tabIndex = -1;
            pinButton.setAttribute('data-action', 'pin-thread');
            pinButton.setAttribute('aria-label', 'Pin thread');
            pinButton.setAttribute('data-state', 'closed');

            const updatePinIcon = (isPinned) => {
                if (isPinned) {
                    pinButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin-off size-4"><path d="M12 17v5"></path><path d="M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89"></path><path d="m2 2 20 20"></path><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11"></path></svg>';
                    threadLink.setAttribute('data-pinned', 'true');
                } else {
                    pinButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin size-4"><path d="M12 17v5"></path><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"></path></svg>';
                    threadLink.removeAttribute('data-pinned');
                }
            };
            updatePinIcon(projectData.isPinned);

            const saveProjectState = () => {
                const projectId = threadLink.getAttribute('data-project-id');
                if (!projectId) return;
                const projectTitle = input.value;
                const isPinned = threadLink.getAttribute('data-pinned') === 'true';
                const projects = loadProjectsFromStorage();
                const existingIndex = projects.findIndex(p => p.id === projectId);
                const currentProjectData = {
                    id: projectId,
                    title: projectTitle,
                    isPinned: isPinned,
                    createdAt: (existingIndex >= 0 && projects[existingIndex].createdAt) ? projects[existingIndex].createdAt : Date.now(), // Preserve original creation date
                    chats: (existingIndex >= 0 && projects[existingIndex].chats) ? projects[existingIndex].chats : [] // Preserve chats
                };
                if (existingIndex >= 0) {
                    projects[existingIndex] = currentProjectData;
                } else {
                    projects.push(currentProjectData);
                }
                saveProjectsToStorage(projects);
            };

            const removeProjectFromStorage = () => {
                const projectId = threadLink.getAttribute('data-project-id');
                if (!projectId) return;
                const projects = loadProjectsFromStorage().filter(p => p.id !== projectId);
                saveProjectsToStorage(projects);
            };

            const cleanupEmptyProjectPinSection = () => {
                setTimeout(() => {
                    const projectPinGroup = contentSidebar.querySelector('.project-pin-group');
                    if (projectPinGroup) {
                        const projectItems = projectPinGroup.querySelector('.project-pin-items');
                        if (projectItems && projectItems.querySelectorAll('a[data-project-id][data-pinned="true"]').length === 0) {
                            // console.log(`${SCRIPT_PREFIX} Project Pin area is empty, removing...);
                            projectPinGroup.remove();
                        } else if (!projectItems) {
                             // console.log(`${SCRIPT_PREFIX} Project Pin area internal structure abnormal, removing...);
                            projectPinGroup.remove();
                        }
                    }
                }, 100);
            };

            // Moved toggleProjectContent outside createProjectItem to avoid redefinition issues
            // It will be defined once in the IIFE scope

            const enableRenaming = () => {
                input.readOnly = false;
                input.classList.remove('pointer-events-none');
                input.classList.add('border', 'border-primary'); // Ensure primary is a defined color or use a standard one
                input.focus();
                input.select();
            };

            const finishRenaming = () => {
                input.readOnly = true;
                input.classList.add('pointer-events-none');
                input.classList.remove('border', 'border-primary');
                input.blur();
                saveProjectState();
            };

            // Only add double-click event to input area, and add debounce mechanism
            let doubleClickTimeout = null;
            input.addEventListener('dblclick', (event) => {
                event.preventDefault();
                event.stopPropagation();

                // Clear previous delay to ensure it doesn't trigger repeatedly
                if (doubleClickTimeout) {
                    clearTimeout(doubleClickTimeout);
                }

                doubleClickTimeout = setTimeout(() => {
                    enableRenaming();
                    doubleClickTimeout = null;
                }, 50);
            });

            // Remove original double-click event on threadLink to avoid conflict
            input.addEventListener('blur', finishRenaming);

            threadLink.addEventListener('dblclick', (event) => {
                event.preventDefault();
                event.stopPropagation();
                enableRenaming();
            });
            input.addEventListener('blur', finishRenaming);
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    finishRenaming();
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    input.value = input.title;
                    finishRenaming();
                }
            });

            const deleteButton = document.createElement('button');
            deleteButton.className = 'rounded-md p-1.5 hover:bg-destructive/50 hover:text-destructive-foreground';
            deleteButton.tabIndex = -1;
            deleteButton.setAttribute('data-action', 'thread-delete');
            deleteButton.setAttribute('aria-label', 'Delete thread');
            deleteButton.setAttribute('data-state', 'closed');
            deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x size-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';
            deleteButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                const projectContent = document.querySelector(`div[data-project-content="${projectData.id}"]`);
                if (projectContent) {
                    projectContent.remove();
                }
                removeProjectFromStorage();
                threadLink.remove();
                cleanupEmptyProjectPinSection();
            });

            pinButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                const isPinned = threadLink.getAttribute('data-pinned') === 'true';
                const projectContent = document.querySelector(`div[data-project-content="${projectData.id}"]`);

                if (threadLink.parentNode) threadLink.parentNode.removeChild(threadLink);
                if (projectContent && projectContent.parentNode) projectContent.parentNode.removeChild(projectContent);

                if (!isPinned) {
                    let projectPinSection = contentSidebar.querySelector('.project-pin-group');
                    if (!projectPinSection) {
                        projectPinSection = document.createElement('div');
                        projectPinSection.className = 'project-pin-group relative flex w-full min-w-0 flex-col p-2';
                        projectPinSection.setAttribute('data-sidebar', 'group');
                        const groupLabel = document.createElement('div');
                        groupLabel.setAttribute('data-sidebar', 'group-label');
                        groupLabel.className = 'flex h-8 shrink-0 select-none items-center rounded-md text-xs font-medium outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-snappy focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 px-1.5 text-color-heading';
                        groupLabel.innerHTML = 'Project Pin';
                        const groupContent = document.createElement('div');
                        groupContent.setAttribute('data-sidebar', 'group-content');
                        groupContent.className = 'w-full text-sm';
                        const menuList = document.createElement('ul');
                        menuList.setAttribute('data-sidebar', 'menu');
                        menuList.className = 'flex w-full min-w-0 flex-col gap-1 project-pin-items';
                        groupContent.appendChild(menuList);
                        projectPinSection.appendChild(groupLabel);
                        projectPinSection.appendChild(groupContent);
                        if (contentSidebar.firstChild) {
                            contentSidebar.insertBefore(projectPinSection, contentSidebar.firstChild);
                        } else {
                            contentSidebar.appendChild(projectPinSection);
                        }
                    }
                    const projectPinItems = projectPinSection.querySelector('.project-pin-items');
                    if (projectPinItems) {
                        projectPinItems.appendChild(threadLink);
                        if (projectContent) projectPinItems.appendChild(projectContent);
                    } else {
                        contentSidebar.prepend(threadLink);
                        if (projectContent) contentSidebar.insertBefore(projectContent, threadLink.nextSibling);
                    }
                    updatePinIcon(true);
                } else {
                    const allGroups = contentSidebar.querySelectorAll('div[data-sidebar="group"]');
                    let targetGroup = null;
                    for (const group of allGroups) {
                        const groupLabel = group.querySelector('div[data-sidebar="group-label"]');
                        const isGroupPinned = groupLabel && (groupLabel.textContent.includes('Pinned') || groupLabel.querySelector('svg.lucide-pin') || groupLabel.textContent.includes('Project Pin'));
                        if (!isGroupPinned && !group.classList.contains('project-pin-group')) {
                            targetGroup = group;
                            break;
                        }
                    }
                    if (targetGroup) {
                        const groupMenu = targetGroup.querySelector('div[data-sidebar="group-content"] ul[data-sidebar="menu"]');
                        if (groupMenu) {
                            groupMenu.prepend(threadLink);
                            if (projectContent) groupMenu.insertBefore(projectContent, threadLink.nextSibling);
                        } else {
                            targetGroup.prepend(threadLink);
                             if (projectContent) targetGroup.insertBefore(projectContent, threadLink.nextSibling);
                        }
                    } else {
                        contentSidebar.prepend(threadLink);
                        if (projectContent) contentSidebar.insertBefore(projectContent, threadLink.nextSibling);
                    }
                    updatePinIcon(false);
                    cleanupEmptyProjectPinSection();
                }
                saveProjectState(); // Save state after moving
            });

            threadLink.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                const contextMenu = document.createElement('div');
                // ... (context menu creation as in original, ensure unique IDs for aria attributes if needed)
                contextMenu.setAttribute('data-side', 'right');
                contextMenu.setAttribute('data-align', 'start');
                contextMenu.setAttribute('role', 'menu');
                contextMenu.setAttribute('aria-orientation', 'vertical');
                contextMenu.setAttribute('data-state', 'open');
                contextMenu.setAttribute('data-radix-menu-content', ''); // Ensure this doesn't conflict
                contextMenu.setAttribute('dir', 'ltr');
                contextMenu.className = 'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2';
                contextMenu.tabIndex = -1;
                contextMenu.style.position = 'absolute';
                contextMenu.style.left = `${event.pageX}px`;
                contextMenu.style.top = `${event.pageY}px`;
                contextMenu.style.pointerEvents = 'auto';

                const isPinned = threadLink.getAttribute('data-pinned') === 'true';
                if (isPinned) {
                    const unpinOption = document.createElement('div');
                    // ... (unpin option creation)
                    unpinOption.setAttribute('role', 'menuitem');
                    unpinOption.className = 'relative cursor-default select-none rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent/30 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 flex flex-row items-center';
                    unpinOption.tabIndex = -1;
                    unpinOption.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin-off mr-2 size-4" aria-hidden="true"><path d="M12 17v5"></path><path d="M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89"></path><path d="m2 2 20 20"></path><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11"></path></svg>Unpin';
                    unpinOption.addEventListener('click', () => {
                        // console.log(`${SCRIPT_PREFIX} Unpinning project...);
                        const projectContent = document.querySelector(`div[data-project-content="${projectData.id}"]`);
                        if (document.body.contains(contextMenu)) document.body.removeChild(contextMenu);

                        threadLink.removeAttribute('data-pinned'); // Update state before DOM manipulation
                        updatePinIcon(false); // Visually unpin

                        if (threadLink.parentNode) threadLink.parentNode.removeChild(threadLink);
                        if (projectContent && projectContent.parentNode) projectContent.parentNode.removeChild(projectContent);

                        let normalGroup = null;
                        const allGroups = contentSidebar.querySelectorAll('div[data-sidebar="group"]');
                        for (const group of allGroups) {
                            const groupLabel = group.querySelector('div[data-sidebar="group-label"]');
                            if (groupLabel && !groupLabel.textContent.includes('Project Pin') && !groupLabel.textContent.includes('Pinned') && !group.classList.contains('project-pin-group')) {
                                normalGroup = group;
                                break;
                            }
                        }
                        if (normalGroup) {
                            const chatList = normalGroup.querySelector('ul[data-sidebar="menu"]');
                            if (chatList) {
                                chatList.insertBefore(threadLink, chatList.firstChild);
                                if (projectContent) chatList.insertBefore(projectContent, threadLink.nextSibling);
                            } else {
                                normalGroup.prepend(threadLink);
                                if (projectContent) normalGroup.insertBefore(projectContent, threadLink.nextSibling);
                            }
                        } else {
                            contentSidebar.appendChild(threadLink);
                             if (projectContent) contentSidebar.insertBefore(projectContent, threadLink.nextSibling);
                        }
                        saveProjectState(); // Save after moving
                        cleanupEmptyProjectPinSection();
                    });
                    contextMenu.appendChild(unpinOption);
                }

                const renameOption = document.createElement('div');
                // ... (rename option creation)
                renameOption.setAttribute('role', 'menuitem');
                renameOption.className = 'relative cursor-default select-none rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent/30 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 flex flex-row items-center';
                renameOption.tabIndex = -1;
                renameOption.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text-cursor mr-2 size-4" aria-hidden="true"><path d="M17 22h-1a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h1"></path><path d="M7 22h1a4 4 0 0 0 4-4v-1"></path><path d="M7 2h1a4 4 0 0 1 4 4v1"></path></svg>Rename';
                renameOption.addEventListener('click', () => {
                    enableRenaming();
                    if (document.body.contains(contextMenu)) document.body.removeChild(contextMenu);
                });

                const deleteOption = document.createElement('div');
                // ... (delete option creation)
                deleteOption.setAttribute('role', 'menuitem');
                deleteOption.className = 'relative cursor-default select-none rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent/30 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 flex flex-row items-center';
                deleteOption.tabIndex = -1;
                deleteOption.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x mr-2 size-4" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>Delete';
                deleteOption.addEventListener('click', () => {
                    const projectContent = document.querySelector(`div[data-project-content="${projectData.id}"]`);
                    if (projectContent) projectContent.remove();
                    removeProjectFromStorage();
                    threadLink.remove();
                    if (document.body.contains(contextMenu)) document.body.removeChild(contextMenu);
                    cleanupEmptyProjectPinSection();
                });

                contextMenu.appendChild(renameOption);
                contextMenu.appendChild(deleteOption);
                document.body.appendChild(contextMenu);

                const closeMenu = () => {
                    if (document.body.contains(contextMenu)) {
                        document.body.removeChild(contextMenu);
                    }
                    document.removeEventListener('click', closeMenu);
                };
                setTimeout(() => { document.addEventListener('click', closeMenu); }, 100);
            });

            threadLink.addEventListener('dragover', handleDragOver);
            threadLink.addEventListener('dragenter', handleDragEnter);
            threadLink.addEventListener('dragleave', handleDragLeave);
            threadLink.addEventListener('drop', handleDrop);

            inputContainer.appendChild(input);
            buttonContainer.appendChild(inputContainer);
            actionsDiv.appendChild(gradientDiv);
            actionsDiv.appendChild(pinButton);
            actionsDiv.appendChild(deleteButton);
            innerDiv.appendChild(buttonContainer);
            innerDiv.appendChild(actionsDiv);
            threadLink.appendChild(innerDiv);
            return threadLink;
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Error creating project item:`, error);
            return null;
        }
    };

    // Define toggleProjectContent once in the IIFE scope
    const toggleProjectContent = (projectId) => {
        try {
            console.log(`${SCRIPT_PREFIX} ===== Toggling project content display: ${projectId} =====`);
            const projectContainer = document.querySelector(`a[data-project-id="${projectId}"]`);
            if (!projectContainer) {
                console.error(`${SCRIPT_PREFIX} Project container not found: ${projectId}`);
                return;
            }

            let projectContent = document.querySelector(`div[data-project-content="${projectId}"]`);

            // If project content container does not exist, create a new one
            if (!projectContent) {
                console.log(`${SCRIPT_PREFIX} Creating new project content container: ${projectId}`);
                projectContent = document.createElement('div');
                projectContent.setAttribute('data-project-content', projectId);
                projectContent.className = 'pl-4 mt-1 space-y-1 project-content';

                // Ensure insertion at the correct position
                if (projectContainer.nextSibling) {
                    projectContainer.parentNode.insertBefore(projectContent, projectContainer.nextSibling);
                } else {
                    projectContainer.parentNode.appendChild(projectContent);
                }
            }

            // Ensure triangle icon exists and is updated
            let triangleIcon = projectContainer.querySelector('.triangle-icon');
            if (!triangleIcon) {
                const innerDiv = projectContainer.querySelector('.relative.flex.w-full.items-center');
                if (innerDiv) {
                    triangleIcon = document.createElement('div');
                    triangleIcon.className = 'triangle-icon mr-1 text-muted-foreground';
                    triangleIcon.style.cssText = `
                        width: 12px;
                        height: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    `;
                    triangleIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="8,4 16,12 8,20"></polygon></svg>';
                    innerDiv.insertBefore(triangleIcon, innerDiv.firstChild);
                }
            }

            // Check current expansion state
            const isCurrentlyExpanded = projectContainer.getAttribute('data-expanded') === 'true';

            if (!isCurrentlyExpanded) {
                // Expand project content
                console.log(`${SCRIPT_PREFIX} Expanding project content: ${projectId}`);

                // Set expansion state
                projectContainer.setAttribute('data-expanded', 'true');

                // Update triangle icon to expanded state
                if (triangleIcon) {
                    triangleIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="4,8 20,8 12,16"></polygon></svg>';
                }

                // Display project content
                projectContent.style.display = 'block';

                // Force update project UI
                console.log(`${SCRIPT_PREFIX} Forcing UI update for project ${projectId}`);
                updateProjectUI(projectId);

                // Ensure content is visible
                setTimeout(() => {
                    projectContent.style.opacity = '1';
                    projectContent.style.visibility = 'visible';

                    // Re-ensure drag and drop functionality is normal
                    setTimeout(() => {
                        // Clear current project's drag and drop flags, force reset
                        const container = document.querySelector(`a[data-project-id="${projectId}"]`);
                        if (container) {
                            container._dragHandlersAttached = false;
                        }
                        makeProjectContainersDroppable();
                        console.log(`${SCRIPT_PREFIX} Project ${projectId} expansion complete, drag and drop functionality reset`);
                    }, 50);
                }, 10);

            } else {
                // Collapse project content
                console.log(`${SCRIPT_PREFIX} Collapsing project content: ${projectId}`);

                projectContainer.removeAttribute('data-expanded');
                projectContent.style.display = 'none';

                // Update triangle icon to collapsed state
                if (triangleIcon) {
                    triangleIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="8,4 16,12 8,20"></polygon></svg>';
                }
            }

            console.log(`${SCRIPT_PREFIX} ===== Project ${projectId} content toggle complete =====`);

        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Error toggling project content:`, error);

            // Error recovery: Attempt to force expand
            try {
                console.log(`${SCRIPT_PREFIX} Attempting error recovery, forcing expansion of project ${projectId}`);
                const container = document.querySelector(`a[data-project-id="${projectId}"]`);
                const content = document.querySelector(`div[data-project-content="${projectId}"]`);

                if (container && content) {
                    container.setAttribute('data-expanded', 'true');
                    content.style.display = 'block';
                    updateProjectUI(projectId);

                    const triangleIcon = container.querySelector('.triangle-icon');
                    if (triangleIcon) {
                        triangleIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="4,8 20,8 12,16"></polygon></svg>';
                    }

                    console.log(`${SCRIPT_PREFIX} Error recovery successful`);
                }
            } catch (recoveryError) {
                console.error(`${SCRIPT_PREFIX} Error recovery failed:`, recoveryError);
            }
        }
    };


    function setupGlobalFunctions() {
        console.log(`${SCRIPT_PREFIX} Setting up global functions...`);
        window.createProjectItem = createProjectItem;
        window.loadProjectsFromStorage = loadProjectsFromStorage;
        window.saveProjectsToStorage = saveProjectsToStorage;
        window.makeProjectContainersDroppable = makeProjectContainersDroppable;
        window.updateProjectUI = updateProjectUI;
        window.addChatToProject = addChatToProject; // Ensure addChatToProject function is globally accessible
        window.toggleProjectContent = toggleProjectContent;
        window.manageChatHighlighting = manageChatHighlighting; // Add highlight management function to global scope

        // All button related functions already defined in global scope, confirming here
        console.log(`${SCRIPT_PREFIX} getCurrentProjectId type:`, typeof window.getCurrentProjectId);
        console.log(`${SCRIPT_PREFIX} createAllButton type:`, typeof window.createAllButton);

        console.log(`${SCRIPT_PREFIX} Global functions setup complete`);
    }
    setupGlobalFunctions();

    const safeQuerySelector = (selector, parent = document) => {
        try {
            if (!parent) return null;
            return parent.querySelector(selector);
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Selector error "${selector}":`, error);
            return null;
        }
    };

    window.addEventListener('error', function(event) {
        event.preventDefault();
        if (event.error && event.error.message &&
            (event.error.message.includes('Cannot read properties of null') ||
             event.error.message.includes('selectionStart') ||
             event.error.message.includes('selectionsStart'))) {
            return true;
        }
        // console.error(`${SCRIPT_PREFIX} Global error caught:, event.error);
    }, true);

    const domObserver = new MutationObserver((mutations, obs) => {
        try {
            // Check to prevent re-execution
            if (window.T3_CHAT_INITIALIZED || window.T3_CHAT_INITIALIZING) {
                console.log(`${SCRIPT_PREFIX} Already initialized or initializing, skipping`);
                return;
            }

            console.log(`${SCRIPT_PREFIX} DOM observer triggered, checking if initialization is possible...`);
            const sidebarReady = document.querySelector('div[data-sidebar="content"]');
            const newChatButton = document.querySelector('div.px-1');

            if (sidebarReady && newChatButton) {
                console.log(`${SCRIPT_PREFIX} Page ready, starting initialization...`);

                // Set initializing flag
                window.T3_CHAT_INITIALIZING = true;

                // Immediately try to execute process()
                setTimeout(() => {
                    try {
                        console.log(`${SCRIPT_PREFIX} Executing process() function...`);

                        // Ensure process function exists
                        if (typeof process !== 'function') {
                            console.warn(`${SCRIPT_PREFIX} process function does not exist, trying to redefine...`);
                            window.T3_CHAT_INITIALIZING = false;
                            return;
                        }

                        const processed = process();
                        console.log(`${SCRIPT_PREFIX} process() result:`, processed);

                        if (processed) {
                            console.log(`${SCRIPT_PREFIX} Project button created successfully, starting to restore projects...`);
                            setTimeout(() => {
                                try {
                                    const restored = restoreProjects();
                                    console.log(`${SCRIPT_PREFIX} restoreProjects() result:`, restored);

                                    // Initialize drag and drop functionality
                                    console.log(`${SCRIPT_PREFIX} Initializing drag and drop functionality...`);
                                    setupDragAndDrop();

                                    // Check if All button needs to be created
                                    setTimeout(() => {
                                        if (typeof window.createAllButton === 'function') {
                                            const allButtonCreated = window.createAllButton();
                                            console.log(`${SCRIPT_PREFIX} All button creation result:`, allButtonCreated);
                                        }

                                        // Mark initialization as complete
                                        window.T3_CHAT_INITIALIZED = true;
                                        window.T3_CHAT_INITIALIZING = false;
                                    }, 1000);

                                    console.log(`${SCRIPT_PREFIX} ✅ Full initialization successful!`);
                                } catch (restoreError) {
                                    console.error(`${SCRIPT_PREFIX} Error restoring projects:`, restoreError);
                                    window.T3_CHAT_INITIALIZING = false;
                                }
                            }, 500);
                        } else {
                            console.warn(`${SCRIPT_PREFIX} ⚠️ process() failed, not retrying to avoid re-execution`);
                            window.T3_CHAT_INITIALIZING = false;
                        }

                        // Disconnect observer after successful initialization
                        obs.disconnect();
                        console.log(`${SCRIPT_PREFIX} DOM observer disconnected`);

                    } catch (error) {
                        console.error(`${SCRIPT_PREFIX} Error during initialization process:`, error);
                        window.T3_CHAT_INITIALIZING = false;
                    }
                }, window.ARC_BROWSER_DETECTED ? 1000 : 300);
            } else {
                console.log(`${SCRIPT_PREFIX} Page not yet ready:`, {
                    sidebarReady: !!sidebarReady,
                    newChatButton: !!newChatButton
                });
            }
        } catch (error) {
            console.error(`${SCRIPT_PREFIX} Error in DOM observer handling:`, error);
            window.T3_CHAT_INITIALIZING = false;
        }
    });

    // Start observing
    domObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'data-sidebar']
    });
    console.log(`${SCRIPT_PREFIX} DOM observer started`);

    // Immediately check if initialization is already possible
    setTimeout(() => {
        // Check to prevent re-execution
        if (window.T3_CHAT_INITIALIZED || window.T3_CHAT_INITIALIZING) {
            console.log(`${SCRIPT_PREFIX} Immediate check: Already initialized or initializing, skipping`);
            return;
        }

        console.log(`${SCRIPT_PREFIX} Immediately checking initialization conditions...`);
        const sidebarReady = document.querySelector('div[data-sidebar="content"]');
        const newChatButton = document.querySelector('div.px-1');

        if (sidebarReady && newChatButton) {
            console.log(`${SCRIPT_PREFIX} Immediate initialization conditions met`);

            // Set initializing flag
            window.T3_CHAT_INITIALIZING = true;

            // If initialization is already possible, execute immediately
            if (typeof process === 'function') {
                const processed = process();
                console.log(`${SCRIPT_PREFIX} Immediate initialization process() result:`, processed);

                if (processed) {
                    domObserver.disconnect();
                    console.log(`${SCRIPT_PREFIX} Immediate initialization successful, disconnecting observer`);

                    setTimeout(() => {
                        try {
                            const restored = restoreProjects();
                            console.log(`${SCRIPT_PREFIX} Immediate restore projects result:`, restored);
                            setupDragAndDrop();

                            // Immediately check All button
                            setTimeout(() => {
                                if (typeof window.createAllButton === 'function') {
                                    const allButtonCreated = window.createAllButton();
                                    console.log(`${SCRIPT_PREFIX} Immediate All button check result:`, allButtonCreated);
                                }

                                // Mark initialization as complete
                                window.T3_CHAT_INITIALIZED = true;
                                window.T3_CHAT_INITIALIZING = false;
                            }, 1000);

                            console.log(`${SCRIPT_PREFIX} ✅ Immediate initialization fully successful!`);
                        } catch (error) {
                            console.error(`${SCRIPT_PREFIX} Error during immediate initialization restore projects:`, error);
                            window.T3_CHAT_INITIALIZING = false;
                        }
                    }, window.ARC_BROWSER_DETECTED ? 1000 : 300);
                } else {
                    window.T3_CHAT_INITIALIZING = false;
                }
            } else {
                console.warn(`${SCRIPT_PREFIX} process function not yet defined, waiting...`);
                window.T3_CHAT_INITIALIZING = false;
            }
        } else {
            console.log(`${SCRIPT_PREFIX} Immediate initialization conditions not met, waiting for DOM observer...`);
        }
    }, window.ARC_BROWSER_DETECTED ? 2000 : 500);

    window.addEventListener('selectionchange', (event) => {
        try {
            const selection = window.getSelection();
            if (!selection || !selection.anchorNode) {
                event.preventDefault();
                return;
            }
        } catch (e) {
            event.preventDefault();
        }
    }, true);

    try {
        const originalGetSelection = window.getSelection;
        window.getSelection = function() {
            try {
                const selection = originalGetSelection.apply(window);
                if (!selection) {
                    return { toString: () => '', anchorNode: null, focusNode: null, anchorOffset: 0, focusOffset: 0, rangeCount: 0, getRangeAt: () => null, addRange: () => {}, removeAllRanges: () => {}, isCollapsed: true, collapse: () => {}, extend: () => {}, setBaseAndExtent: () => {}, selectAllChildren: () => {}, removeRange: () => {}, containsNode: () => false, deleteFromDocument: () => {}, setPosition: () => {} };
                }
                return selection;
            } catch (e) {
                console.error(`${SCRIPT_PREFIX} Safe getSelection error caught:`, e);
                return { toString: () => '', anchorNode: null, focusNode: null, anchorOffset: 0, focusOffset: 0, rangeCount: 0, getRangeAt: () => null, addRange: () => {}, removeAllRanges: () => {}, isCollapsed: true, collapse: () => {}, extend: () => {}, setBaseAndExtent: () => {}, selectAllChildren: () => {}, removeRange: () => {}, containsNode: () => false, deleteFromDocument: () => {}, setPosition: () => {} };
            }
        };
    } catch (e) {
        console.error(`${SCRIPT_PREFIX} Failed to set up safe getSelection:`, e);
    }

    // restoreProjects is defined outside IIFE but called from within, ensure it uses global functions correctly
    // It's better to move it inside IIFE or ensure all its dependencies are globally available when it runs.
    // For now, it's kept outside as per original structure.

})(); // End of IIFE

// Page change listener - detects need for All button
(function() {
    let currentUrl = window.location.pathname;
    let currentProjectId = null;

    // Listen for URL changes
    const checkAllButtonNeed = () => {
        const newUrl = window.location.pathname;
        if (newUrl !== currentUrl) {
            const previousUrl = currentUrl;
            currentUrl = newUrl;
            console.log('[T3 Chat Script] 🔄 URL changed, checking All button requirement...');

            setTimeout(() => {
                // Check current Project ID
                const newProjectId = window.getCurrentProjectId ? window.getCurrentProjectId() : null;
                const wasInSameProject = currentProjectId === newProjectId && newProjectId !== null;
                currentProjectId = newProjectId;

                // Check All button state
                const allButton = document.querySelector('#all-mode-toggle');
                const isAllModeActive = allButton && allButton.textContent === 'All' &&
                                       allButton.style.background && allButton.style.background.includes('pink');

                // Update chat highlight state
                if (typeof manageChatHighlighting === 'function') {
                    manageChatHighlighting(newUrl);
                }

                if (wasInSameProject && isAllModeActive) {
                    console.log('[T3 Chat Script] 🔄 Switched chat within the same Project, All mode enabled, re-fetching messages...');

                    // Re-fetch Project messages
                    if (typeof window.getAllProjectMessages === 'function') {
                        const messagesData = window.getAllProjectMessages();

                        if (messagesData.success) {
                            // Update temporarily stored message data
                            window.projectAllModeData = {
                                projectId: messagesData.projectId,
                                projectTitle: messagesData.projectTitle,
                                collectedAt: Date.now(),
                                totalChats: messagesData.totalChats,
                                uniqueChats: messagesData.uniqueChats,
                                availableChats: messagesData.availableChats,
                                chats: messagesData.chats,
                                totalMessages: messagesData.totalMessages,
                                contextPrompt: messagesData.contextPrompt,
                                cacheStats: messagesData.cacheStats
                            };

                            console.log(`[T3 Chat Script] ✅ Updated Project "${messagesData.projectTitle}" message library: ${messagesData.totalMessages} messages from ${messagesData.uniqueChats} unique conversations`);
                        } else {
                            console.log('[T3 Chat Script] ⚠️ Re-fetch messages failed:', messagesData.message);
                        }
                    }
                } else {
                    // Check if All button needs to be created or removed
                    if (typeof window.createAllButton === 'function') {
                        const created = window.createAllButton();
                        console.log('[T3 Chat Script] 🔘 All button check result:', created);
                    }
                }
            }, 1000);
        }
    };

    // Listen for browser history changes
    window.addEventListener('popstate', checkAllButtonNeed);

    // Listen for History API changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function() {
        originalPushState.apply(history, arguments);
        setTimeout(checkAllButtonNeed, 100);
    };

    history.replaceState = function() {
        originalReplaceState.apply(history, arguments);
        setTimeout(checkAllButtonNeed, 100);
    };

    // Listen for custom navigation event
    window.addEventListener('t3chat-navigation', (e) => {
        console.log('[T3 Chat Script] 🧭 T3Chat custom navigation:', e.detail);
        setTimeout(checkAllButtonNeed, 500);
    });

    // Initialize current Project ID
    setTimeout(() => {
        currentProjectId = window.getCurrentProjectId ? window.getCurrentProjectId() : null;

        // Initialize chat highlight state
        if (typeof window.manageChatHighlighting === 'function') {
            const currentUrl = window.location.pathname;
            window.manageChatHighlighting(currentUrl);
        }

        // Initialize All button state
        if (typeof window.createAllButton === 'function') {
            const created = window.createAllButton();
            console.log('[T3 Chat Script] 🔘 Initialize All button check result:', created);
        }
    }, 1000);

    console.log('[T3 Chat Script] 🔄 Page change listener set up (supports Project message re-fetching)');
})();

// restoreProjects is defined in the global scope
var restoreProjects = function() {
    try {
        console.log('[TM Script] 🔄 Attempting to restore saved projects');
        const contentSidebar = document.querySelector('div[data-sidebar="content"]');
        if (!contentSidebar) {
            console.warn('[TM Script] Sidebar not found, cannot restore projects');
                                    return false;
                                }

        const projects = window.loadProjectsFromStorage ? window.loadProjectsFromStorage() : [];
        if (!projects || projects.length === 0) {
            console.log('[TM Script] No projects to restore');
            return false;
        }
        console.log(`[TM Script] Restoring ${projects.length} projects from local storage`);

        let pinnedProjects = [];
        let unpinnedProjects = [];
        projects.forEach(projectData => {
            // Check if a Project with the same ID already exists
            const existingProject = document.querySelector(`a[data-project-id="${projectData.id}"]`);
            if (existingProject) {
                console.log(`[TM Script] Project ${projectData.id} already exists, skipping creation`);
                return; // Skip already existing projects
            }

            if (projectData.isPinned) {
                pinnedProjects.push(projectData);
            } else {
                unpinnedProjects.push(projectData);
            }
        });

        // If all projects already exist, return success directly
        if (pinnedProjects.length === 0 && unpinnedProjects.length === 0) {
            console.log('[TM Script] All projects already exist, no need to restore');
            return true;
        }

        pinnedProjects.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        unpinnedProjects.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

        if (pinnedProjects.length > 0) {
            let projectPinSection = contentSidebar.querySelector('.project-pin-group');
            if (!projectPinSection) {
                projectPinSection = document.createElement('div');
                projectPinSection.className = 'project-pin-group relative flex w-full min-w-0 flex-col p-2';
                projectPinSection.setAttribute('data-sidebar', 'group');
                const groupLabel = document.createElement('div');
                groupLabel.setAttribute('data-sidebar', 'group-label');
                groupLabel.className = 'flex h-8 shrink-0 select-none items-center rounded-md text-xs font-medium outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-snappy focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 px-1.5 text-color-heading';
                groupLabel.innerHTML = 'Project Pin';
                const groupContent = document.createElement('div');
                groupContent.setAttribute('data-sidebar', 'group-content');
                groupContent.className = 'w-full text-sm';
                const menuList = document.createElement('ul');
                menuList.setAttribute('data-sidebar', 'menu');
                menuList.className = 'flex w-full min-w-0 flex-col gap-1 project-pin-items';
                groupContent.appendChild(menuList);
                projectPinSection.appendChild(groupLabel);
                projectPinSection.appendChild(groupContent);
                contentSidebar.insertBefore(projectPinSection, contentSidebar.firstChild);
            }
            const pinnedContainer = projectPinSection.querySelector('.project-pin-items');
            if (pinnedContainer) {
                pinnedProjects.forEach(projectData => {
                    const createItemFn = window.createProjectItem; // Use globally exposed function
                    const projectItem = createItemFn(projectData, contentSidebar);
                    if (projectItem) {
                        pinnedContainer.insertBefore(projectItem, pinnedContainer.firstChild);
                        console.log(`[TM Script] Restored pinned project: ${projectData.title}`);
                        if (projectData.chats && projectData.chats.length > 0) {
                            const updateUIFn = window.updateProjectUI; // Use globally exposed function
                            updateUIFn(projectData.id);
                        }
                    }
                });
            }
        }

        if (unpinnedProjects.length > 0) {
            let normalGroup = null;
            const allGroups = contentSidebar.querySelectorAll('div[data-sidebar="group"]');
            for (const group of allGroups) {
                const groupLabel = group.querySelector('div[data-sidebar="group-label"]');
                if (groupLabel && !groupLabel.textContent.includes('Project Pin') && !groupLabel.textContent.includes('Pinned') && !group.classList.contains('project-pin-group')) {
                    normalGroup = group;
                    break;
                }
            }
            if (normalGroup) {
                const chatList = normalGroup.querySelector('ul[data-sidebar="menu"]');
                if (chatList) {
                    unpinnedProjects.forEach(projectData => {
                        const createItemFn = window.createProjectItem; // Use globally exposed function
                        const projectItem = createItemFn(projectData, contentSidebar);
                        if (projectItem) {
                            chatList.insertBefore(projectItem, chatList.firstChild);
                            console.log(`[TM Script] Restored normal project: ${projectData.title}`);
                            if (projectData.chats && projectData.chats.length > 0) {
                                const updateUIFn = window.updateProjectUI; // Use globally exposed function
                                updateUIFn(projectData.id);
                            }
                        }
                    });
                }
            }
        }

        console.log('[TM Script] ✅ Project restoration complete');
        return true;
    } catch (error) {
        console.error(`[TM Script] Project restoration failed:`, error);
        return false;
    }
};

function process() {
    console.log('[T3 Chat Script] 🔧 Starting execution of process() function...');

    // Detailed check of the sidebar
    const sidebar = document.querySelector('div.px-1');
    console.log('[T3 Chat Script] Sidebar check:', {
        found: !!sidebar,
        element: sidebar
    });

    if (!sidebar) {
        console.log('[T3 Chat Script] ❌ Sidebar not found (div.px-1)');

        // Try other possible selectors
        const alternateSidebars = [
            'div[class*="px-"]',
            'nav div',
            'aside div',
            'div[data-sidebar] div'
        ];

        for (const selector of alternateSidebars) {
            const altSidebar = document.querySelector(selector);
            if (altSidebar) {
                console.log(`[T3 Chat Script] Found alternative sidebar: ${selector}`, altSidebar);
                break;
            }
        }

        return false;
    }

    // Set sidebar styles
    console.log('[T3 Chat Script] Setting sidebar styles...');
    sidebar.style.setProperty('display', 'flex', 'important');
    sidebar.style.setProperty('align-items', 'center', 'important');
    sidebar.style.setProperty('gap', '4px', 'important');

    // Detailed check of the original button
    console.log('[T3 Chat Script] Finding original New Chat button...');
    const allButtons = sidebar.querySelectorAll('a[data-discover="true"]:not(.tm-clone)');
    console.log('[T3 Chat Script] Buttons found:', allButtons.length);

    allButtons.forEach((btn, index) => {
        const href = btn.getAttribute('href');
        const text = btn.querySelector('span')?.textContent.trim() || btn.textContent.trim();
        console.log(`[T3 Chat Script] Button ${index}: href="${href}", text="${text}"`);
    });

    const originalBtn = Array.from(allButtons).find(btn => {
        const href = btn.getAttribute('href');
        const text = btn.querySelector('span')?.textContent.trim() || btn.textContent.trim();
        return (href === '/' || href === '/chat') && text === 'New Chat';
    });

    if (!originalBtn) {
        console.log('[T3 Chat Script] ❌ Original New Chat button not found');
        console.log('[T3 Chat Script] Attempting to use the first button as a template...');
        // Fallback: Use the first available button
        const firstButton = allButtons[0];
        if (firstButton) {
            console.log('[T3 Chat Script] Using the first button as a template:', firstButton);
        } else {
            console.log('[T3 Chat Script] ❌ No available buttons found');
            return false;
        }
    } else {
        console.log('[T3 Chat Script] ✅ Original New Chat button found:', originalBtn);
    }

    // Check if Project button already exists
    const existingClone = sidebar.querySelector('.tm-clone');
    if (existingClone) {
        console.log('[T3 Chat Script] ✅ Project button already exists, skipping creation');
        return true;
    }

    // Use the found button (original button or first button)
    const templateBtn = originalBtn || allButtons[0];

    console.log('[T3 Chat Script] Setting template button styles...');
    templateBtn.style.setProperty('flex', '1 1 0%', 'important');
    templateBtn.style.setProperty('margin-right', '4px', 'important');
    templateBtn.style.setProperty('width', 'auto', 'important');
    templateBtn.style.setProperty('display', 'inline-flex', 'important');

    console.log('[T3 Chat Script] Creating Project button...');
    const clone = templateBtn.cloneNode(true);
    clone.classList.add('tm-clone');
    clone.removeAttribute('href');
    clone.style.setProperty('flex', '1 1 0%', 'important');
    clone.style.setProperty('width', 'auto', 'important');
    clone.style.cursor = 'pointer';

    const span = clone.querySelector('span');
    if (span) {
        span.textContent = 'Project';
        console.log('[T3 Chat Script] Setting button text to "Project"');
    } else {
        console.log('[T3 Chat Script] ⚠️ Span element not found, attempting to set text directly');
        clone.textContent = 'Project';
    }

    console.log('[T3 Chat Script] Adding Project button click event...');
    clone.addEventListener('click', e => {
        try {
            e.preventDefault();
            e.stopPropagation();
            console.log('[T3 Chat Script] 🏗️ Project button clicked');

            const contentSidebar = document.querySelector('div[data-sidebar="content"]');
            if (!contentSidebar) {
                console.log('[T3 Chat Script] ❌ Sidebar content area not found');
                return;
            }

            const projectId = window.generateUniqueId();
            const projectData = {
                id: projectId,
                title: 'Project',
                isPinned: false,
                createdAt: Date.now(),
                chats: []
            };

            console.log('[T3 Chat Script] Creating new Project:', projectData);

            const projectItem = window.createProjectItem(projectData, contentSidebar);
            if (projectItem) {
                // Find an appropriate position to insert the item
                const allGroups = contentSidebar.querySelectorAll('div[data-sidebar="group"]');
                let targetGroup = null;

                for (const group of allGroups) {
                    const groupLabel = group.querySelector('div[data-sidebar="group-label"]');
                    const isPinnedGroup = groupLabel && (
                        groupLabel.textContent.includes('Pinned') ||
                        groupLabel.querySelector('svg.lucide-pin') ||
                        groupLabel.textContent.includes('Project Pin')
                    );
                    if (!isPinnedGroup && !group.classList.contains('project-pin-group')) {
                        targetGroup = group;
                        break;
                    }
                }

                if (targetGroup) {
                    const groupMenu = targetGroup.querySelector('div[data-sidebar="group-content"] ul[data-sidebar="menu"]');
                    if (groupMenu) {
                        groupMenu.prepend(projectItem);
                    } else {
                        targetGroup.prepend(projectItem);
                    }
                } else {
                    contentSidebar.prepend(projectItem);
                }

                // Save to local storage
                const projects = window.loadProjectsFromStorage();
                projects.push(projectData);
                window.saveProjectsToStorage(projects);

                // Highlight new project
                projectItem.style.transition = 'background-color 0.5s ease';
                projectItem.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';

                // Ensure drag and drop functionality is set up immediately
                if (window.makeProjectContainersDroppable) {
                    setTimeout(() => {
                        window.makeProjectContainersDroppable();

                        // Automatically expand the newly created project container
                        if (window.toggleProjectContent && projectId) {
                            window.toggleProjectContent(projectId);
                        }
                        console.log(`[T3 Chat Script] Drag and drop functionality for new project set up, ID: ${projectId}`);
                    }, 100);
                }

                setTimeout(() => { projectItem.style.backgroundColor = ''; }, 1000);
                console.log('[T3 Chat Script] ✅ Project created successfully');
            } else {
                console.log('[T3 Chat Script] ❌ createProjectItem returned null');
            }
        } catch (error) {
            console.error('[T3 Chat Script] ❌ Error creating Project:', error);
        }
    }, true);

    clone.style.setProperty('display', 'inline-flex', 'important');

    console.log('[T3 Chat Script] Inserting Project button into DOM...');
    templateBtn.after(clone);

    console.log('[T3 Chat Script] ✅ process() function executed successfully!');
    return true;
}

// Add functionality to capture Project conversation messages
window.getAllProjectMessages = function() {
    try {
        console.log('🔍 [All Mode] Starting to get full Project message library...');

        // Check if in a Project chat
        const projectId = window.getCurrentProjectId();
        if (!projectId) {
            console.log('🔍 [All Mode] Not in a Project chat');
            return { success: false, message: 'Currently not in a Project chat' };
        }

        // Get Project data
        const projects = window.loadProjectsFromStorage ? window.loadProjectsFromStorage() : [];
        const currentProject = projects.find(p => p.id === projectId);

        if (!currentProject || !currentProject.chats || currentProject.chats.length === 0) {
            console.log('🔍 [All Mode] No conversations in Project');
            return { success: false, message: 'No conversations in Project' };
        }

        console.log(`🔍 [All Mode] Project "${currentProject.title}" contains ${currentProject.chats.length} conversations`);

        // Deduplication: Use Set to avoid duplicate conversation URLs
        const uniqueChats = [];
        const seenUrls = new Set();

        currentProject.chats.forEach(chat => {
            if (!seenUrls.has(chat.url)) {
                seenUrls.add(chat.url);
                uniqueChats.push(chat);
            }
        });

        const chatDetails = uniqueChats.map((chat, index) => ({
            url: chat.url,
            title: chat.title,
            messageCount: 0,
            lastUpdated: Date.now()
        }));

        console.log(`🔍 [All Mode] After deduplication, ${chatDetails.length} unique conversations`);

        // Generate concise context prompt
        let contextPrompt = `=== Project "${currentProject.title}" Conversation List ===\n`;

        chatDetails.forEach((chat, index) => {
            contextPrompt += `${index + 1}. ${chat.title}\n`;
        });

        contextPrompt += `\nThe above are the ${chatDetails.length} conversations in Project "${currentProject.title}".\n`;

        return {
            success: true,
            projectId: projectId,
            projectTitle: currentProject.title,
            totalChats: currentProject.chats.length,
            uniqueChats: chatDetails.length,
            availableChats: chatDetails.length, // Assuming all unique chats are available for this simplified version
            chats: chatDetails,
            totalMessages: chatDetails.length, // Simplified: one "message" per chat for context
            contextPrompt: contextPrompt,
            cacheStats: { total: chatDetails.length, collected: chatDetails.length, failed: 0 }
        };

    } catch (error) {
        console.error('🔍 [All Mode] Error getting messages:', error);
        return { success: false, message: 'Error getting messages: ' + error.message };
    }
};
