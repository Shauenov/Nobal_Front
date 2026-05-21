import styles from './auth.module.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <div className={styles.media}>
          {/* Save the students photo to Frontend/public/login-hero.jpg */}
          <img
            src="/login-hero.png"
            alt="Студенты в библиотеке"
          />
        </div>
        <div className={styles.panel}>{children}</div>
      </div>
    </div>
  );
}
