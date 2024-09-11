'use client';

import Link from 'next/link';

interface Props {
  id: string;
  name: string;
  description: string;
}

const ProjectListItem: React.FC<Props> = ({ id, name, description }) => {
  return (
    <div className="flex flex-col gap-4 bg-white rounded-lg tracking-wide justify-between p-4">
      <div className="flex flex-col gap-4">
        <div className=" font-semibold text-lg">{name}</div>
        <div className=" leading-3 text-sm">{description}</div>
      </div>
      <div className="p-2">
        <Link
          className="text-sm font-semibold px-4 py-2 rounded-3xl hover:bg-gray-800/70  hover:text-white w-full border-gray-800 border block text-center"
          href={`/rag-extra-2/${id}/chats`}
        >
          New Chat
        </Link>
      </div>
    </div>
  );
};

export default ProjectListItem;
