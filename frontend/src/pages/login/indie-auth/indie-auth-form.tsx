import { useAuthorizationParams } from './hooks';

import styles from './indie-auth-form.module.scss';

export const IndieAuthForm = () => {
  const { clientId, redirectUri, state } = useAuthorizationParams();

  return (
    <div className={styles.bgImg}>
      <form
        action="https://indieauth.com/auth"
        method="get"
        className={styles.container}
      >
        <label htmlFor="url">Web Address:</label>
        <input
          id="url"
          type="text"
          name="me"
          placeholder="yourdomain.com"
        />
        <button
          type="submit"
          className={styles.btn}
        >
          Login
        </button>
        <input
          type="hidden"
          name="client_id"
          value={clientId}
        />
        <input
          type="hidden"
          name="redirect_uri"
          value={redirectUri}
        />
        <input
          type="hidden"
          name="state"
          value={state}
        />
        <p>
          <a
            href="https://indielogin.com/setup"
            target="_blank"
            rel="noreferrer"
          >
            How to Set Up Your Website
          </a>
        </p>
      </form>
    </div>
  );
};
