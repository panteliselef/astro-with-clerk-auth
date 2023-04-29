import { FC, useState } from 'react';
import { Entry, entriesStore } from '../atoms/enties';
import { getGuestbook } from '../utils';

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
  const [message, setMessage] = useState('');
  return (
    <form
      className="bg-black/20 backdrop-blur-md p-2 rounded-lg border border-zinc-800 flex focus-within:ring-2 focus-within:ring-white"
      onSubmit={async (e) => {
        console.log(e);
        e.preventDefault();
        await createEntry(message);
        const entries = await fetchEntries();
        entriesStore.set(entries);
      }}
    >
      <input
        value={message}
        type="text"
        required
        placeholder="Type something to remember you by ..."
        minLength={3}
        className="indent-1 text-sm h-full w-full appearance-none bg-transparent outline-none"
        onChange={(e) => setMessage(e.target.value)}
      />
      <button className="text-sm appearance-none bg-black/20 backdrop-blur-md py-1 px-3 rounded-lg border border-zinc-800 flex focus-within:ring-2 focus-within:ring-white">
        Sign
      </button>
    </form>
  );
};
