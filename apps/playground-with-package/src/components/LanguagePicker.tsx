import { updateClerkOptions } from "astro-clerk-auth/client/hotload";
import { type ChangeEvent } from "react";

export function LanguagePicker() {
  const onChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    let localization: any;

    if (value === "fr") {
      localization = (await import("@clerk/localizations/fr-FR")).frFR
    } else {
      localization = undefined;
    }

    updateClerkOptions({
      localization,
    });
  };
  return (
    <select
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      onChange={onChange}
    >
      <option value="en">English</option>
      <option value="fr">French</option>
    </select>
  );
}
