import { motion } from 'framer-motion';
import { FaRobot } from 'react-icons/fa';
import { GrUserManager } from 'react-icons/gr';
import ReactMarkdown from 'react-markdown';

const MessageItem = ({
  message,
  isMan,
}: {
  message: string;
  isMan: boolean;
  }) => {
  return isMan ? (
    <div className="flex mb-4 justify-end w-full">
      <div className="block max-w-4xl p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 font-normal text-gray-700 ">
        <ReactMarkdown>{message}</ReactMarkdown>
      </div>
      <div className="flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full ml-4">
        <div className="font-medium text-gray-600 ">
          <GrUserManager />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex mb-4">
      <div className="flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full mr-4">
        <div className="font-medium text-gray-600 ">
          <FaRobot />
        </div>
      </div>
      <div className="block max-w-4xl p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 font-normal text-gray-700 ">
        <ReactMarkdown>{message}</ReactMarkdown>
      </div>
    </div>
  );
};

export default MessageItem;
