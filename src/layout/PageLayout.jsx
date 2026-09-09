export function PageLayout({ children }) {
  return (
    <div className="page-layout">
      <header className="page-layout__header">{/* nav/logo goes here */}</header>
      <main className="page-layout__main">{children}</main>
    </div>
  );
}