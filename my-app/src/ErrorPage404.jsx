import { useRouteError } from "react-router-dom";

function ErrorPage404() {
  const error = useRouteError();

  return (
    <div id="error-page">
      <h1>It is an Error Page</h1>
      <h2>404 Not Found Error</h2>
      <p>
        <i>{error.statusText}</i>
      </p>
      <p>
        <i>{error.data}</i>
      </p>
    </div>
  );
}

export default ErrorPage404;
