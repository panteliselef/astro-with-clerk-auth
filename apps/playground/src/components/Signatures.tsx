import type { FC } from 'react';
import { useStore } from '@nanostores/react';
import { entriesStore } from '../atoms/enties';

export const Signatures: FC = () => {
  const $entries = useStore(entriesStore);
  return (
    <div className="bg-black/20 backdrop-blur-md p-5 rounded-lg border border-zinc-800">
      {$entries.map((entry) => (
        <div key={entry.id} className="flex flex-col space-y-1 mb-4">
          <div className="w-full text-sm break-words">
            <span className="text-neutral-600 dark:text-neutral-400 mr-1">{entry.created_by}:</span>
            {entry.message}
          </div>
        </div>
      ))}
    </div>
  );
};
