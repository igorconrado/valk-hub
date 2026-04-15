type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="font-display text-[22px] font-semibold text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-[13px] text-[#666]">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
