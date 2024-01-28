import type { FC } from 'react';
import { useState } from 'react';
import type { Entry } from '../atoms/enties';
import { entriesStore } from '../atoms/enties';

const createEntry = async (message: string) => {
  await fetch('/api/guestbook', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({
      message,
    }),
  });
};

const fetchEntries = () => fetch('/api/guestbook').then((res) => res.json() as unknown as Entry[]);

export const GuestbookForm: FC = () => {
  const [disabled, setDisabled] = useState(false)
  return (
    <form
      className="bg-black/20 backdrop-blur-md p-2 rounded-lg border border-zinc-800 flex focus-within:ring-2 focus-within:ring-white"
      onSubmit={async (e) => {
        e.preventDefault();
        setDisabled(true)
        const fields = new FormData(e.target as HTMLFormElement)
        const message = fields.get('signature') as string
        await createEntry(message);
        (e.target as HTMLFormElement).reset()
        const entries = await fetchEntries();
        entriesStore.set(entries);
        setDisabled(false)
      }}
    >
      <input
        type="text"
        name="signature"
        required
        disabled={disabled}
        placeholder="Type something to remember you by ..."
        minLength={3}
        className="indent-1 text-sm h-full w-full appearance-none bg-transparent outline-none"
      />
      <button className="text-sm appearance-none bg-black/20 backdrop-blur-md py-1 px-3 rounded-lg border border-zinc-800 flex focus-within:ring-2 focus-within:ring-white">
        Sign
      </button>
    </form>
  );
};
