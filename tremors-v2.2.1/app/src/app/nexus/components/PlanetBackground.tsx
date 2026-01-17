import Image from 'next/image';
import styles from './PlanetBackground.module.css';

const PlanetBackground = () => {
  return (
    <>
      <div className={styles.overlay}></div>
      <div className={styles.imageContainer}>
        <Image
          src="/moon.png"
          alt="Planet background"
          fill
          sizes="100vw"
          priority
          className={styles.imageBg}
          unoptimized
        />
      </div>
    </>
  );
};

export default PlanetBackground;