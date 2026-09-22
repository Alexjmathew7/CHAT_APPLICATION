// ============================================================
// MY AI - APP.JS
// ============================================================


// ============================================================
// STATE
// ============================================================

let currentConversation = null;

let selectedImage = null;

let uploadedDocument = null;


// ============================================================
// DOM
// ============================================================

let chat = null;

let input = null;

let sendButton = null;

let imageInput = null;

let imagePreview = null;

let documentInput = null;

let documentPreview = null;

let conversationList = null;


// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        // ----------------------------------------------------
        // Get DOM elements
        // ----------------------------------------------------

        chat =
            document.getElementById("chat");

        input =
            document.getElementById("message");

        sendButton =
            document.getElementById("sendButton");

        imageInput =
            document.getElementById("imageInput");

        imagePreview =
            document.getElementById("imagePreview");

        documentInput =
            document.getElementById("documentInput");

        documentPreview =
            document.getElementById("documentPreview");

        conversationList =
            document.getElementById(
                "conversationList"
            );


        // ----------------------------------------------------
        // Check important elements
        // ----------------------------------------------------

        if (!chat) {
            console.error(
                "Chat element #chat was not found."
            );
        }

        if (!input) {
            console.error(
                "Message input #message was not found."
            );
        }

        if (!sendButton) {
            console.error(
                "Send button #sendButton was not found."
            );
        }


        // ----------------------------------------------------
        // Markdown
        // ----------------------------------------------------

        if (
            typeof marked !== "undefined"
        ) {

            marked.setOptions({
                breaks: true,
                gfm: true
            });

        }


        // ----------------------------------------------------
        // Image upload
        // ----------------------------------------------------

        initializeImageUpload();


        // ----------------------------------------------------
        // Document upload
        // ----------------------------------------------------

        initializeDocumentUpload();


        // ----------------------------------------------------
        // Keyboard
        // ----------------------------------------------------

        initializeKeyboard();


        // ----------------------------------------------------
        // Load conversations
        // ----------------------------------------------------

        await loadConversations();


        // ----------------------------------------------------
        // Focus
        // ----------------------------------------------------

        if (input) {

            input.focus();

        }

    }
);


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text == null
            ? ""
            : String(text);


    return div.innerHTML;

}


// ============================================================
// SCROLL
// ============================================================

function scrollToBottom() {

    if (!chat) {
        return;
    }


    chat.scrollTop =
        chat.scrollHeight;

}


// ============================================================
// REMOVE WELCOME
// ============================================================

function removeWelcome() {

    const welcome =
        document.getElementById(
            "welcome"
        );


    if (welcome) {

        welcome.remove();

    }

}


// ============================================================
// ADD MESSAGE
// ============================================================

function addMessage(
    role,
    text
) {

    if (!chat) {

        return null;

    }


    removeWelcome();


    const row =
        document.createElement("div");


    row.className =
        "message-row " + role;


    const avatar =
        document.createElement("div");


    avatar.className =
        "avatar";


    avatar.textContent =
        role === "user"
            ? "U"
            : "✦";


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    const safeText =
        text == null
            ? ""
            : String(text);


    // --------------------------------------------------------
    // USER
    // --------------------------------------------------------

    if (role === "user") {

        content.textContent =
            safeText;

    }


    // --------------------------------------------------------
    // ASSISTANT
    // --------------------------------------------------------

    else {

        if (
            typeof marked !== "undefined"
        ) {

            try {

                content.innerHTML =
                    marked.parse(
                        safeText
                    );

            } catch (error) {

                console.error(
                    "Markdown error:",
                    error
                );


                content.textContent =
                    safeText;

            }

        } else {

            content.textContent =
                safeText;

        }


        highlightCode(
            content
        );


        addCodeCopyButtons(
            content
        );

    }


    row.appendChild(
        avatar
    );


    row.appendChild(
        content
    );


    chat.appendChild(
        row
    );


    scrollToBottom();


    return content;

}


// ============================================================
// ADD FILE MESSAGE
// ============================================================

function addFileMessage(
    filename
) {

    if (!chat) {
        return;
    }


    removeWelcome();


    const row =
        document.createElement("div");


    row.className =
        "message-row user";


    const avatar =
        document.createElement("div");


    avatar.className =
        "avatar";


    avatar.textContent =
        "U";


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    content.innerHTML = `

        <div class="uploaded-file-message">

            <span class="uploaded-file-icon">
                📄
            </span>

            <span>
                ${escapeHtml(filename)}
            </span>

        </div>

    `;


    row.appendChild(
        avatar
    );


    row.appendChild(
        content
    );


    chat.appendChild(
        row
    );


    scrollToBottom();

}


// ============================================================
// THINKING
// ============================================================

function showThinking() {

    removeThinking();


    removeWelcome();


    if (!chat) {
        return;
    }


    const row =
        document.createElement("div");


    row.id =
        "thinking";


    row.className =
        "message-row assistant";


    row.innerHTML = `

        <div class="avatar">
            ✦
        </div>

        <div class="message-content">

            <div class="thinking">

                <span></span>
                <span></span>
                <span></span>

                <span
                    class="thinking-text"
                    style="
                        width:auto;
                        height:auto;
                        background:none;
                        margin-left:5px;
                    "
                >
                    Thinking...
                </span>

            </div>

        </div>

    `;


    chat.appendChild(
        row
    );


    scrollToBottom();

}


// ============================================================
// REMOVE THINKING
// ============================================================

function removeThinking() {

    const thinking =
        document.getElementById(
            "thinking"
        );


    if (thinking) {

        thinking.remove();

    }

}


// ============================================================
// HIGHLIGHT CODE
// ============================================================

function highlightCode(
    container
) {

    if (
        !container ||
        typeof hljs === "undefined"
    ) {

        return;

    }


    const blocks =
        container.querySelectorAll(
            "pre code"
        );


    blocks.forEach(
        (block) => {

            try {

                hljs.highlightElement(
                    block
                );

            } catch (error) {

                console.warn(
                    "Highlight.js error:",
                    error
                );

            }

        }
    );

}


// ============================================================
// CODE COPY BUTTONS
// ============================================================

function addCodeCopyButtons(
    container
) {

    if (!container) {
        return;
    }


    const blocks =
        container.querySelectorAll(
            "pre"
        );


    blocks.forEach(
        (pre) => {

            if (
                pre.parentElement &&
                pre.parentElement.classList.contains(
                    "code-wrapper"
                )
            ) {

                return;

            }


            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "code-wrapper";


            pre.parentNode.insertBefore(
                wrapper,
                pre
            );


            wrapper.appendChild(
                pre
            );


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "copy-code";


            button.textContent =
                "Copy";


            button.addEventListener(
                "click",
                async function () {

                    const code =
                        pre.querySelector(
                            "code"
                        );


                    if (!code) {
                        return;
                    }


                    try {

                        await navigator.clipboard.writeText(
                            code.innerText
                        );


                        button.textContent =
                            "Copied!";


                        setTimeout(
                            function () {

                                button.textContent =
                                    "Copy";

                            },
                            1500
                        );


                    } catch (error) {

                        console.error(
                            "Copy failed:",
                            error
                        );


                        button.textContent =
                            "Failed";


                        setTimeout(
                            function () {

                                button.textContent =
                                    "Copy";

                            },
                            1500
                        );

                    }

                }
            );


            wrapper.appendChild(
                button
            );

        }
    );

}


// ============================================================
// LOAD CONVERSATIONS
// ============================================================

async function loadConversations() {

    if (!conversationList) {
        return;
    }


    try {

        const response =
            await fetch(
                "/api/conversations"
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load conversations."
            );

        }


        const conversations =
            await response.json();


        conversationList.innerHTML =
            "";


        if (
            !Array.isArray(
                conversations
            ) ||
            conversations.length === 0
        ) {

            conversationList.innerHTML = `

                <div class="empty-history">
                    No conversations yet
                </div>

            `;


            return;

        }


        conversations.forEach(
            function (conversation) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "conversation-item";


                if (
                    Number(currentConversation) ===
                    Number(conversation.id)
                ) {

                    item.classList.add(
                        "active"
                    );

                }


                item.innerHTML = `

                    <div class="conversation-main">

                        <span class="conversation-icon">
                            💬
                        </span>

                        <span class="conversation-title">
                            ${escapeHtml(
                                conversation.title ||
                                "New Chat"
                            )}
                        </span>

                    </div>

                    <button
                        type="button"
                        class="delete-chat"
                        title="Delete chat"
                        aria-label="Delete chat"
                    >
                        ×
                    </button>

                `;


                const main =
                    item.querySelector(
                        ".conversation-main"
                    );


                const deleteButton =
                    item.querySelector(
                        ".delete-chat"
                    );


                if (main) {

                    main.addEventListener(
                        "click",
                        function () {

                            loadConversation(
                                conversation.id
                            );

                        }
                    );

                }


                if (deleteButton) {

                    deleteButton.addEventListener(
                        "click",
                        function (event) {

                            event.stopPropagation();


                            deleteConversation(
                                conversation.id
                            );

                        }
                    );

                }


                conversationList.appendChild(
                    item
                );

            }
        );


    } catch (error) {

        console.error(
            "History error:",
            error
        );


        conversationList.innerHTML = `

            <div class="empty-history">
                Could not load history
            </div>

        `;

    }

}


// ============================================================
// NEW CHAT
// ============================================================

async function newChat() {

    try {

        const response =
            await fetch(
                "/api/conversations",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        title: "New Chat"
                    })
                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch (error) {

            throw new Error(
                "Server returned an invalid response."
            );

        }


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Could not create conversation."
            );

        }


        currentConversation =
            data.id;


        // ----------------------------------------------------
        // Reset chat
        // ----------------------------------------------------

        if (chat) {

            chat.innerHTML = `

                <div
                    id="welcome"
                    class="welcome"
                >

                    <div class="welcome-icon">
                        ✦
                    </div>

                    <h1>
                        How can I help you?
                    </h1>

                    <p>
                        Your private AI assistant running
                        locally with LM Studio.
                    </p>

                    <div class="suggestions">

                        <button
                            type="button"
                            onclick="useSuggestion(this)"
                        >
                            Explain quantum computing simply
                        </button>

                        <button
                            type="button"
                            onclick="useSuggestion(this)"
                        >
                            Write a Python program
                        </button>

                        <button
                            type="button"
                            onclick="useSuggestion(this)"
                        >
                            Help me build a project
                        </button>

                        <button
                            type="button"
                            onclick="useSuggestion(this)"
                        >
                            Tell me something interesting
                        </button>

                    </div>

                </div>

            `;

        }


        // ----------------------------------------------------
        // Clear attachments
        // ----------------------------------------------------

        clearDocument();

        removeImage();


        // ----------------------------------------------------
        // Refresh sidebar
        // ----------------------------------------------------

        await loadConversations();


        if (input) {

            input.value =
                "";

            autoResize();

            input.focus();

        }


        return currentConversation;


    } catch (error) {

        console.error(
            "New chat error:",
            error
        );


        addMessage(
            "assistant",
            "⚠️ " +
            error.message
        );


        return null;

    }

}


// ============================================================
// LOAD CONVERSATION
// ============================================================

async function loadConversation(
    id
) {

    try {

        const response =
            await fetch(
                `/api/conversations/${id}`
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch (error) {

            throw new Error(
                "Server returned an invalid response."
            );

        }


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Could not load conversation."
            );

        }


        currentConversation =
            Number(id);


        // ----------------------------------------------------
        // Clear chat
        // ----------------------------------------------------

        if (chat) {

            chat.innerHTML =
                "";

        }


        // ----------------------------------------------------
        // Clear attachments
        // ----------------------------------------------------

        clearDocument();

        removeImage();


        // ----------------------------------------------------
        // Restore messages
        // ----------------------------------------------------

        if (
            Array.isArray(
                data.messages
            )
        ) {

            data.messages.forEach(
                function (message) {

                    addMessage(
                        message.role,
                        message.content
                    );

                }
            );

        }


        await loadConversations();


        scrollToBottom();


        if (input) {

            input.focus();

        }


    } catch (error) {

        console.error(
            "Load conversation error:",
            error
        );


        addMessage(
            "assistant",
            "⚠️ " +
            error.message
        );

    }

}


// ============================================================
// DELETE CONVERSATION
// ============================================================

async function deleteConversation(
    id
) {

    const confirmed =
        window.confirm(
            "Delete this conversation?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/conversations/${id}`,
                {
                    method: "DELETE"
                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch (error) {

            data = {};

        }


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Could not delete conversation."
            );

        }


        if (
            Number(currentConversation) ===
            Number(id)
        ) {

            currentConversation =
                null;


            clearDocument();

            removeImage();


            if (chat) {

                chat.innerHTML = `

                    <div
                        id="welcome"
                        class="welcome"
                    >

                        <div class="welcome-icon">
                            ✦
                        </div>

                        <h1>
                            How can I help you?
                        </h1>

                        <p>
                            Your private AI assistant
                            running locally with LM Studio.
                        </p>

                    </div>

                `;

            }

        }


        await loadConversations();


        if (input) {

            input.focus();

        }


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            error.message
        );

    }

}


// ============================================================
// SEND MESSAGE
// ============================================================

async function sendMessage() {

    const text =
        input
            ? input.value.trim()
            : "";


    // --------------------------------------------------------
    // Nothing to send
    // --------------------------------------------------------

    if (
        !text &&
        !selectedImage &&
        !uploadedDocument
    ) {

        return;

    }


    // --------------------------------------------------------
    // Prevent double sending
    // --------------------------------------------------------

    if (
        sendButton &&
        sendButton.disabled
    ) {

        return;

    }


    try {

        // ----------------------------------------------------
        // Create conversation if necessary
        // ----------------------------------------------------

        if (!currentConversation) {

            const id =
                await newChat();


            if (!id) {

                throw new Error(
                    "Could not create a conversation."
                );

            }

        }


        // ----------------------------------------------------
        // Copy attachment state
        // ----------------------------------------------------

        const image =
            selectedImage;


        const document =
            uploadedDocument;


        // ----------------------------------------------------
        // Clear text box
        // ----------------------------------------------------

        if (input) {

            input.value =
                "";

            autoResize();

        }


        if (sendButton) {

            sendButton.disabled =
                true;

        }


        // ----------------------------------------------------
        // Show user text
        // ----------------------------------------------------

        if (text) {

            addMessage(
                "user",
                text
            );

        }


        // ----------------------------------------------------
        // Show image
        // ----------------------------------------------------

        if (image) {

            addImageMessage();

        }


        // ----------------------------------------------------
        // Show document
        // ----------------------------------------------------

        if (document) {

            addFileMessage(
                document.filename
            );

        }


        // ----------------------------------------------------
        // Thinking
        // ----------------------------------------------------

        showThinking();


        // ----------------------------------------------------
        // Build request
        // ----------------------------------------------------

        const requestBody = {

            conversation_id:
                currentConversation,

            message:
                text

        };


        // ----------------------------------------------------
        // Image
        // ----------------------------------------------------

        if (image) {

            requestBody.image =
                image;

        }


        // ----------------------------------------------------
        // Document
        // ----------------------------------------------------

        if (document) {

            requestBody.document_name =
                document.filename;

            requestBody.document_content =
                document.content;

        }


        // ----------------------------------------------------
        // Send
        // ----------------------------------------------------

        const response =
            await fetch(
                "/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify(
                        requestBody
                    )
                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch (error) {

            throw new Error(
                "The server returned an invalid response."
            );

        }


        // ----------------------------------------------------
        // Stop thinking
        // ----------------------------------------------------

        removeThinking();


        // ----------------------------------------------------
        // Error
        // ----------------------------------------------------

        if (
            !response.ok ||
            data.error
        ) {

            addMessage(
                "assistant",
                "⚠️ " +
                (
                    data.error ||
                    "Something went wrong."
                )
            );


            return;

        }


        // ----------------------------------------------------
        // Assistant response
        // ----------------------------------------------------

        addMessage(
            "assistant",
            data.message ||
            "The model returned an empty response."
        );


        // ----------------------------------------------------
        // Clear attachments
        // ----------------------------------------------------

        removeImage();

        clearDocument();


        // ----------------------------------------------------
        // Refresh history
        // ----------------------------------------------------

        await loadConversations();


    } catch (error) {

        removeThinking();


        console.error(
            "Chat error:",
            error
        );


        addMessage(
            "assistant",
            "⚠️ " +
            (
                error.message ||
                "Could not send the message."
            )
        );


    } finally {

        if (sendButton) {

            sendButton.disabled =
                false;

        }


        if (input) {

            input.focus();

        }

    }

}


// ============================================================
// ADD IMAGE MESSAGE
// ============================================================

function addImageMessage() {

    if (!chat || !selectedImage) {
        return;
    }


    removeWelcome();


    const row =
        document.createElement("div");


    row.className =
        "message-row user";


    const avatar =
        document.createElement("div");


    avatar.className =
        "avatar";


    avatar.textContent =
        "U";


    const content =
        document.createElement("div");


    content.className =
        "message-content";


    const image =
        document.createElement("img");


    image.src =
        selectedImage;


    image.alt =
        "Uploaded image";


    image.className =
        "chat-image";


    content.appendChild(
        image
    );


    row.appendChild(
        avatar
    );


    row.appendChild(
        content
    );


    chat.appendChild(
        row
    );


    scrollToBottom();

}


// ============================================================
// IMAGE UPLOAD
// ============================================================

function initializeImageUpload() {

    if (!imageInput) {

        console.warn(
            "#imageInput was not found."
        );


        return;

    }


    imageInput.addEventListener(
        "change",
        function () {

            const file =
                this.files &&
                this.files[0];


            if (!file) {
                return;
            }


            // ------------------------------------------------
            // Validate type
            // ------------------------------------------------

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select a valid image."
                );


                this.value =
                    "";


                return;

            }


            // ------------------------------------------------
            // 10 MB image limit
            // ------------------------------------------------

            if (
                file.size >
                10 * 1024 * 1024
            ) {

                alert(
                    "Image must be smaller than 10 MB."
                );


                this.value =
                    "";


                return;

            }


            // ------------------------------------------------
            // Clear document because the backend
            // processes image/document separately.
            // ------------------------------------------------

            if (uploadedDocument) {

                clearDocument();

            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    selectedImage =
                        event.target.result;


                    if (imagePreview) {

                        imagePreview.innerHTML = `

                            <div class="preview-container">

                                <img
                                    src="${escapeHtml(
                                        selectedImage
                                    )}"
                                    class="preview-image"
                                    alt="Selected image"
                                >

                                <button
                                    type="button"
                                    class="remove-image"
                                    onclick="removeImage()"
                                    title="Remove image"
                                >
                                    ×
                                </button>

                            </div>

                        `;

                    }

                };


            reader.onerror =
                function () {

                    selectedImage =
                        null;


                    alert(
                        "Could not read the image."
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// ============================================================
// REMOVE IMAGE
// ============================================================

function removeImage() {

    selectedImage =
        null;


    if (imageInput) {

        imageInput.value =
            "";

    }


    if (imagePreview) {

        imagePreview.innerHTML =
            "";

    }

}


// ============================================================
// ATTACHMENT MENU
// ============================================================

function openAttachmentMenu() {

    const choice =
        window.prompt(
            "Choose an attachment:\n\n" +
            "1 - Image\n" +
            "2 - Document\n\n" +
            "Enter 1 or 2:"
        );


    if (choice === "1") {

        if (imageInput) {

            imageInput.click();

        }

    } else if (choice === "2") {

        if (documentInput) {

            documentInput.click();

        }

    }

}


// ============================================================
// DOCUMENT UPLOAD
// ============================================================

function initializeDocumentUpload() {

    if (!documentInput) {

        console.warn(
            "#documentInput was not found."
        );


        return;

    }


    documentInput.addEventListener(
        "change",
        async function () {

            const file =
                this.files &&
                this.files[0];


            if (!file) {
                return;
            }


            // ------------------------------------------------
            // Allowed extensions
            // ------------------------------------------------

            const allowedExtensions = [
                "pdf",
                "txt",
                "md",
                "csv",
                "json",
                "docx"
            ];


            const filename =
                file.name.toLowerCase();


            const extension =
                filename.includes(".")
                    ? filename
                        .split(".")
                        .pop()
                    : "";


            if (
                !allowedExtensions.includes(
                    extension
                )
            ) {

                alert(
                    "Unsupported file type. " +
                    "Allowed: PDF, TXT, MD, CSV, JSON, DOCX."
                );


                clearDocument();


                return;

            }


            // ------------------------------------------------
            // 20 MB
            // ------------------------------------------------

            if (
                file.size >
                20 * 1024 * 1024
            ) {

                alert(
                    "Document must be smaller than 20 MB."
                );


                clearDocument();


                return;

            }


            // ------------------------------------------------
            // Clear image
            // ------------------------------------------------

            if (selectedImage) {

                removeImage();

            }


            // ------------------------------------------------
            // Show uploading
            // ------------------------------------------------

            if (documentPreview) {

                documentPreview.innerHTML = `

                    <div class="document-uploading">

                        ⏳ Uploading
                        ${escapeHtml(file.name)}...

                    </div>

                `;

            }


            const formData =
                new FormData();


            formData.append(
                "file",
                file
            );


            try {

                const response =
                    await fetch(
                        "/api/upload",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                let data = null;


                try {

                    data =
                        await response.json();

                } catch (error) {

                    throw new Error(
                        "Server returned an invalid upload response."
                    );

                }


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Document upload failed."
                    );

                }


                if (
                    !data.success ||
                    !data.content
                ) {

                    throw new Error(
                        "No readable content was returned."
                    );

                }


                // ------------------------------------------------
                // Save document
                // ------------------------------------------------

                uploadedDocument = {

                    filename:
                        data.filename ||
                        file.name,

                    content:
                        data.content

                };


                // ------------------------------------------------
                // Preview
                // ------------------------------------------------

                if (documentPreview) {

                    documentPreview.innerHTML = `

                        <div class="document-preview">

                            <span class="document-icon">
                                📄
                            </span>

                            <span class="document-name">
                                ${escapeHtml(
                                    data.filename ||
                                    file.name
                                )}
                            </span>

                            ${
                                data.truncated
                                    ? `
                                        <span
                                            class="document-warning"
                                        >
                                            Large document truncated
                                        </span>
                                    `
                                    : ""
                            }

                            <button
                                type="button"
                                class="remove-document"
                                onclick="clearDocument()"
                                title="Remove document"
                            >
                                ×
                            </button>

                        </div>

                    `;

                }


            } catch (error) {

                console.error(
                    "Document upload error:",
                    error
                );


                uploadedDocument =
                    null;


                if (documentPreview) {

                    documentPreview.innerHTML = `

                        <div class="document-error">

                            ❌
                            ${escapeHtml(
                                error.message
                            )}

                        </div>

                    `;

                }


                this.value =
                    "";

            }

        }
    );

}


// ============================================================
// CLEAR DOCUMENT
// ============================================================

function clearDocument() {

    uploadedDocument =
        null;


    if (documentInput) {

        documentInput.value =
            "";

    }


    if (documentPreview) {

        documentPreview.innerHTML =
            "";

    }

}


// ============================================================
// SUGGESTION
// ============================================================

function useSuggestion(
    button
) {

    if (!button || !input) {
        return;
    }


    input.value =
        button.textContent.trim();


    autoResize();


    input.focus();


    sendMessage();

}


// ============================================================
// TEXTAREA RESIZE
// ============================================================

function autoResize() {

    if (!input) {
        return;
    }


    input.style.height =
        "auto";


    input.style.height =
        Math.min(
            input.scrollHeight,
            180
        ) + "px";

}


// ============================================================
// KEYBOARD
// ============================================================

function initializeKeyboard() {

    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        autoResize
    );


    input.addEventListener(
        "keydown",
        function (event) {

            // ------------------------------------------------
            // Enter = send
            // Shift + Enter = new line
            // ------------------------------------------------

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();


                if (
                    sendButton &&
                    !sendButton.disabled
                ) {

                    sendMessage();

                }

            }

        }
    );

}