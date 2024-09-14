'use client';

import MessageItem from '@/components/MessageItem/MessageItem';
import { usePostMessageMutation } from '@/features/rag-extra-2/projectSlice';
import { useParams } from 'next/navigation';
import { useState } from 'react';

interface Props {
  onSubmit: (message: string) => Promise<void>;
}

const FormInput = (props: Props) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const sendMessage = async () => {
    setIsLoading(true);
    await props.onSubmit(message);
    setIsLoading(false);
  };

  return (
    <div className="w-full justify-center items-center">
      <label htmlFor="chat" className="sr-only">
        Your message
      </label>
      <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50">
        <textarea
          id="chat"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 "
          placeholder="Your message..."
        ></textarea>
        <button
          onClick={sendMessage}
          className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 "
        >
          {!isLoading ? (
            <svg
              className="w-5 h-5 rotate-90 rtl:-rotate-90"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 18 20"
            >
              <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
            </svg>
          ) : (
            <div className="flex justify-center" aria-label="読み込み中">
              <div className="animate-spin w-5 h-5 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          )}

          <span className="sr-only">Send message</span>
        </button>
      </div>
    </div>
  );
};

export default function ChatPage() {
  const { projectId } = useParams();

  const [postMessage] = usePostMessageMutation();
  const [messages, setMessages] = useState<
    { message: string; isMan: boolean }[]
  >([]);

  const onSubmit = async (message: string) => {
    const response = await postMessage({
      projectId: projectId as string,
      body: { message },
    });

    if (response.data) {
      setMessages((prev) => [
        ...prev,
        { message, isMan: true },
        { message: response.data?.message, isMan: false },
      ]);
    }
  };

  return (
    <main className="flex flex-col text-gray-800 w-full h-full overflow-y-auto">
      <div className="flex bg-slate-300 h-5/6 p-4 justify-center">
        <div className="flex flex-col w-[80%]">
          {messages.map((m, i) => (
            <MessageItem isMan={m.isMan} message={m.message} key={i} />
          ))}
        </div>
      </div>
      <div className="flex h-1/6 p-4 justify-center items-center">
        <FormInput onSubmit={onSubmit} />
      </div>
    </main>
  );
}
