import GeminiChatbot from '../../components/admin/GeminiChatbot';

export default function GeminiChatbotPage() {
  return (
    <div className="flex flex-col h-full">
      <h1 className="text-2xl font-bold p-6 pb-4">Gemini Chatbot</h1>
      <div className="flex-1 overflow-hidden">
        <GeminiChatbot />
      </div>
    </div>
  );
}
