import { useIsFetching } from '@tanstack/react-query';

export default function Header({ children }) {
  const fetchingCount = useIsFetching();
  return (
    <>
      <div id="main-header-loading">{fetchingCount > 0 && <progress />}</div>
      <header id="main-header">
        <div id="header-title">
          <h1>React Events</h1>
        </div>
        <nav>{children}</nav>
      </header>
    </>
  );
}
