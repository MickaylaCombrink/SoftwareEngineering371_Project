export function EmptyState({ message = 'Nothing here yet.' }) {
  return <div className="empty-state">{message}</div>;
}