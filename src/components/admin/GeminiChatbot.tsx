import { ChatService } from '../../services/chatService';
import { useChatStore } from '../../store/useChatStore';
import { Message } from '../../types/chat';
import { useEffect, useRef, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BUSINESS_ASSISTANT_PROMPT } from '../../config/chat';

const GeminiChatbot: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { addMessage, messages } = useChatStore();
    const [currentBotMessage, setCurrentBotMessage] = useState<Message | null>(null);
    const chatServiceRef = useRef<ChatService | null>(null);
    const [uploadedFile, setUploadedFile] = useState<{
        uri: string;
        mimeType: string;
        name?: string;
    } | null>(null);

    const suggestedQuestions = [
        "Let's make a promo for a product",
        "Let's brainstorm some marketing ideas",
        "What are some ways to boost employee productivity?",
        "How can we improve customer engagement?",
        "Can you help create a social media strategy?",
        "What are the latest business trends?",
        "How can we optimize our sales funnel?",
        "Give me ideas for team-building activities",
        "Help me write a professional email",
        "What are effective ways to handle customer complaints?",
    ];

    useEffect(() => {
        const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
        const MODEL_NAME = 'gemini-1.5-flash';

        if (!chatServiceRef.current) {
            chatServiceRef.current = new ChatService({
                apiKey: API_KEY || '',
                model: MODEL_NAME,
                maxTokens: 1000,
            });
        }

        if (messages.length > 0) {
            chatServiceRef.current.replaceMessages(messages);
        }
    }, [messages]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("handleFileUpload called", e.target.files);
        if (!e.target.files) return;
        const file = e.target.files[0];

        try {
            const fileData = await file.arrayBuffer();
            const fileDataBase64 = btoa(String.fromCharCode(...new Uint8Array(fileData)));
            console.log('fileDataBase64:', fileDataBase64)
            console.log('file type', file.type)
            console.log('file name', file.name)

            setUploadedFile({
                uri: fileDataBase64,
                mimeType: file.type,
                name: file.name,
            });
             // Immediately trigger analysis after file upload
            handleSendMessage("Analyze the uploaded file");
        } catch (err) {
            console.error('Error uploading file:', err);
            setError('Error uploading file. Please try again.');
        }
    };


  const handleSendMessage = useCallback(async (messageOverride?: string) => {
        const userMessageText = messageOverride ? messageOverride : inputValue.trim();
        if (!userMessageText || !chatServiceRef.current) return;

        setError(null);
        setIsLoading(true);
        setInputValue('');

        const userMessage: Message = {
            id: uuidv4(),
            content: userMessageText,
            sender: 'user',
            timestamp: Date.now(),
            context: { sessionId: 'default' },
        };

        const streamingMessage: Message = {
            id: uuidv4(),
            content: '',
            sender: 'ai',
            timestamp: Date.now(),
            context: { sessionId: 'default' },
        };

        try {
            addMessage(userMessage);
            setCurrentBotMessage(streamingMessage);
            let apiResponse;
             //if file was uploaded
             if (uploadedFile?.uri) {
                const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

                let prompt = userMessageText;

                if (uploadedFile.mimeType.startsWith("image/")) {
                    prompt = `
                     Analyze the following image and respond to the question: ${userMessageText}
                     `;
                }
                else if (
                    uploadedFile.mimeType === 'application/pdf' ||
                    uploadedFile.mimeType === 'application/msword' ||
                    uploadedFile.mimeType ===
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ) {
                    prompt = `
                        Analyze the content of the document provided and answer the question: ${userMessageText}.
                    `;
                }

                const result = await model.generateContent([
                     prompt,
                     {
                        inlineData: {
                            data: uploadedFile.uri,
                            mimeType: uploadedFile.mimeType,
                        },
                     },
                ]);
                apiResponse = { text: result.response.text() };
                console.log("API Response Text", result.response.text())

            }

           // No file was uploaded so just perform the Gemini API Chat
            else {
               apiResponse = await chatServiceRef.current.generateResponse(
                   userMessageText,
                   BUSINESS_ASSISTANT_PROMPT,
                    (text) => {
                        setCurrentBotMessage((prev) => (prev ? { ...prev, content: text } : null));
                    }
                );
            }
            if (apiResponse?.text) {
                const finalBotMessage: Message = {
                    ...streamingMessage,
                    content: apiResponse.text,
                };
                addMessage(finalBotMessage);
            }
        } catch (err) {
            console.error('Error in chat:', err);
            setError(err instanceof Error ? err.message : 'An error occurred during the conversation');

            const errorMessage: Message = {
                id: uuidv4(),
                content: 'I apologize, but I encountered an error. Please try again.',
                sender: 'ai',
                timestamp: Date.now(),
                context: { sessionId: 'default' },
            };
            addMessage(errorMessage);
        } finally {
            setIsLoading(false);
            setCurrentBotMessage(null);
            setUploadedFile(null);
        }
    }, [inputValue, addMessage, uploadedFile]);


    useEffect(() => {
        if (chatContainerRef.current) {
            const element = chatContainerRef.current;
            element.scrollTop = element.scrollHeight;
        }
    }, [messages, currentBotMessage]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    }, []);

    const handleInputKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
               // We call handleSendMessage here without any argument which means the normal input value will be used
                handleSendMessage();
            }
        },
        [handleSendMessage]
    );

    const handleClearChat = useCallback(() => {
        useChatStore.getState().clearMessages();
    }, []);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [transitioning, setTransitioning] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTransitioning(true);
            setTimeout(() => {
                setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % suggestedQuestions.length);
                setTransitioning(false);
            }, 500);
        }, 10000);
        return () => clearInterval(interval);
    }, [suggestedQuestions.length]);

  const handleSendButtonClick = useCallback(() => {
       // We call handleSendMessage here without any argument which means the normal input value will be used
      handleSendMessage();
    }, [handleSendMessage])

    return (
        <div className="flex flex-col h-full bg-dark-500 w-full max-w-sm sm:max-w-full mx-auto">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${
                            message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-lg shadow-md ${
                                message.sender === 'user'
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-br-none'
                                    : 'bg-gradient-to-r from-teal-500 to-teal-700 text-black rounded-bl-none'
                            }`}
                        >
                            <div className="whitespace-pre-wrap break-words">{message.content}</div>
                        </div>
                    </div>
                ))}

                {currentBotMessage && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] p-3 rounded-lg shadow-md bg-gradient-to-r from-teal-500 to-teal-700 text-gray-800 rounded-bl-none">
                            <div className="whitespace-pre-wrap break-words">
                                {currentBotMessage.content || 'Thinking...'}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-700 bg-gray-800 p-4">
                <div
                    className={`pb-2 transition-opacity duration-500 ${
                        transitioning ? 'opacity-0' : 'opacity-100'
                    }`}
                >
                    <button
                        onClick={() => setInputValue(suggestedQuestions[currentQuestionIndex])}
                        className="px-4 py-2 shadow-md text-white rounded-full text-sm transition-colors hover:bg-blue-700 border-2 border-teal-500 bg-transparent text-teal-500 hover:text-white"
                    >
                        {suggestedQuestions[currentQuestionIndex]}
                    </button>
                </div>
                <div className="flex gap-2 relative mt-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleInputKeyDown}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        className="flex-1 min-w-0 px-4 py-2 text-white bg-gray-900 shadow-md border-none rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                         onClick={handleSendButtonClick}
                        disabled={isLoading || inputValue.trim() === ''}
                        className="px-4 py-2 text-sm font-semibold shadow-md text-white rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? 'Sending...' : 'Send'}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.769 59.769 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            id="fileUpload"
                            disabled={isLoading}
                            onChange={handleFileUpload}
                            className="opacity-0 z-10 absolute w-[120px] h-[38px]"
                        />
                        <label
                            htmlFor="fileUpload"
                            className="relative flex items-center justify-center px-4 py-2 text-sm font-semibold shadow-md text-teal-500 rounded-full bg-transparent hover:bg-teal-700 hover:text-white disabled:opacity-50 gap-2 pointer-events-none"
                        >
                            Upload File
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M6 7.5h12" />
                            </svg>
                        </label>
                        <button
                            onClick={handleClearChat}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-semibold shadow-md text-red-500 rounded-full bg-transparent hover:bg-red-700 hover:text-white disabled:opacity-50 flex items-center gap-2"
                        >
                            Clear Chat
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeminiChatbot;