
import styles from './BlackholeBackground.module.css';

const BlackholeBackground = () => {
  return (
    <>
      <div className={styles.overlay}></div>
      <video
        autoPlay
        loop
        muted
        playsInline
        className={styles.videoBg}
      >
        <source src="/blackhole.webm" type="video/webm" />
      </video>
    </>
  );
};

export default BlackholeBackground;