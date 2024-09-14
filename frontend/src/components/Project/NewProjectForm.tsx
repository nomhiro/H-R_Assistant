'use client';

import { ProjectCreateRequest } from '@/types/types';
import { FormEvent, useState } from 'react';

interface Props {
  onSubmit: (payload: ProjectCreateRequest) => Promise<void>;
}

const NewProjectForm: React.FC<Props> = ({ onSubmit }: Props) => {
  const [projectName, setProjectName] = useState<string>('');
  const [projectDescription, setProjectDescription] = useState<string>('');

  const onSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit({ name: projectName, description: projectDescription });
    setProjectName('');
    setProjectDescription('');
  };

  return (
    <form className="flex flex-col gap-4 p-4" onSubmit={onSubmitForm}>
      <div className="flex flex-col gap-2">
        <label htmlFor="projectName">Project Name</label>
        <input
          className="border-gray-300 border rounded-lg py-1 px-2"
          type="text"
          id="projectName"
          value={projectName}
          required
          onChange={(e) => setProjectName(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="projectDescription">Project Description</label>
        <textarea
          className="border-gray-300 border rounded-lg py-1 px-2"
          rows={3}
          id="projectDescription"
          value={projectDescription}
          required
          onChange={(e) => setProjectDescription(e.target.value)}
        />
      </div>
      <div className=" text-right">
        <button
          type="submit"
          className="bg-gray-800 text-white hover:bg-gray-800/70 px-4 py-2 rounded-lg"
        >
          Create
        </button>
      </div>
    </form>
  );
};

export default NewProjectForm;
