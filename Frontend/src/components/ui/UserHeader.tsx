import AppHeader from "./AppHeader";

type Props = {
  name?: string;
  onSignOut: () => void;
};

export default function UserHeader({ name, onSignOut }: Props) {
  return (
    <AppHeader>
      <span className="text-sm text-[#64748B]">{name}</span>
      <button
        type="button"
        onClick={onSignOut}
        className="text-sm text-[#64748B] hover:text-[#0D1B2A] transition"
      >
        Sign out
      </button>
    </AppHeader>
  );
}
