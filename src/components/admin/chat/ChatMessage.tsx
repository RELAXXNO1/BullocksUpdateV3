import { Message } from '../../../types/chat';
import { Volume2, VolumeX } from 'lucide-react';
import { speak } from '../../../utils/tts';
import { useChatStore } from '../../../store/useChatStore';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { isSpeaking, setIsSpeaking } = useChatStore();

  const handleSpeak = async () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      await speak(message.content);
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
      <div
        className={`inline-block max-w-[80%] p-3 rounded-lg ${
          message.sender === 'user'
            ? 'bg-primary-600/90 text-white'
            : 'bg-dark-500/90 text-gray-200'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.sender === 'ai' && (
          <button
            onClick={handleSpeak}
            className="mt-2 p-1 hover:bg-dark-400/50 rounded transition-colors"
            title={isSpeaking ? 'Stop speaking' : 'Speak message'}
          >
            {isSpeaking ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      <div className="text-xs text-secondary-400 mt-1">
        {message.timestamp.toLocaleTimeString()}
      </div>
    </div>
  );
}