import styles from './styles.module.scss';

export const Login = () => {
  const origin = window.location.origin
  const state = Math.random().toString().substring(2, 8); 

  return (
    <div className={styles.bgImg}>
    <form action="https://indieauth.com/auth" method="get" className={styles.container}>
      <label htmlFor="url">Web Address:</label>
      <input id="url" type="text" name="me" placeholder="yourdomain.com" />
      <button type="submit" className={styles.btn}>Login</button>
      <input type="hidden" name="client_id" value={`${origin}`} />
      <input type="hidden" name="redirect_uri" value={`${origin}`} />
      <input type="hidden" name="state" value={state} />
    </form>
  </div>
  )
}
