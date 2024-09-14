'use client';

import NewProjectForm from '@/components/Project/NewProjectForm';
import ProjectListItem from '@/components/Project/ProjectListItem';
import {
  useGetProjectsQuery,
  usePostProjectMutation,
} from '@/features/rag-extra-2/projectSlice';
import { ProjectCreateRequest } from '@/types/types';
import { useState } from 'react';
import { FaX } from 'react-icons/fa6';

function NewProjectFormWithButton() {
  const [showNewProjectForm, setShowNewProjectForm] = useState<boolean>(false);
  const [postProject, { error, reset }] = usePostProjectMutation();

  const onClose = () => {
    setShowNewProjectForm(false);
    reset();
  };

  const onSubmitNewProjectForm = async (payload: ProjectCreateRequest) => {
    await postProject(payload);
  };

  return (
    <div className="relative w-full">
      <button
        className="bg-gray-800 hover:bg-gray-800/70 text-white rounded-lg py-2 px-4"
        onClick={() => setShowNewProjectForm(true)}
      >
        New Project
      </button>
      {showNewProjectForm && (
        <div className="bg-white rounded-lg shadow-2xl absolute w-full top-0">
          <div className=" text-right p-4">
            <button onClick={onClose} type="button">
              <FaX />
            </button>
          </div>

          {error && (
            <div className="p-4">
              <div className="bg-red-200/20 border-red-700 text-red-700 p-4 border">
                Project Create Failed. {error.data.message}
              </div>
            </div>
          )}
          <NewProjectForm onSubmit={onSubmitNewProjectForm} />
        </div>
      )}
    </div>
  );
}

export default function ExtraPage2() {
  const { data, error, isLoading } = useGetProjectsQuery();

  return (
    <main className="flex flex-col text-gray-800 w-full h-full overflow-y-auto">
      <div className="flex flex-col gap-4 p-4 bg-slate-300 h-full">
        <NewProjectFormWithButton />

        {error && (
          <div className="border w-full p-4 bg-red-200/20 border-red-700 rounded-xl text-red-700">
            <p>Error: can not loading projects</p>
          </div>
        )}

        {data &&
          data.projects.map((project) => {
            return (
              <ProjectListItem
                key={project.id}
                id={project.id}
                name={project.name}
                description={project.description}
              />
            );
          })}
      </div>
    </main>
  );
}
