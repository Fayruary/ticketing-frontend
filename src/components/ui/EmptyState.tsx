interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({
  message = "Data tidak ditemukan",
}: EmptyStateProps) {
  return (
    <div className="text-center py-10 text-gray-500">
      {message}
    </div>
  );
}