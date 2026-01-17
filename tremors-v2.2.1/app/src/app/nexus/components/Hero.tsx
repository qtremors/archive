'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import styles from './Hero.module.css';
import BlackholeBackground from './BlackholeBackground';
import PlanetBackground from './PlanetBackground';

const spaceships = [
  { id: 1, name: 'Resume', url: '/resume', image: '/ship66.png', imageBack: '/ship66-rev.png' },
  { id: 2, name: 'Terminal', url: '/terminal', image: '/ship55.png', imageBack: '/ship55-rev.png' },
  { id: 3, name: 'News', url: '/news', image: '/ship66.png', imageBack: '/ship66-rev.png' },
];

const REVEAL_DURATION = 1.0;
const EXIT_DURATION = 1.5;
const ROTATION_DURATION = 0.1;


const spaceshipVariants: Variants = {
  hidden: {
    y: '-50vh',
    x: 0,
    opacity: 0,
    scale: 0.3,
  },
  visible: (i: number) => ({
    y: -30,
    x: (i - (spaceships.length - 1) / 2) * 140,
    opacity: 1,
    scale: 1,
    transition: {
      duration: REVEAL_DURATION,
      delay: i * 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
  exit: (i: number) => ({
    y: '-45vh',
    x: 0,
    opacity: 0,
    scale: 0.3,
    transition: {
      duration: EXIT_DURATION,
      delay: ROTATION_DURATION + (spaceships.length - 1 - i) * 0.3,
      ease: 'easeIn',
    },
  }),
};


const fuselageVariants: Variants = {
  visible: {
    rotateY: 0,
  },
  exit: {
    rotateY: -180,
    transition: {
      duration: ROTATION_DURATION,
      ease: 'easeInOut',
    },
  },
};


const Hero = () => {
  const [isDeployed, setIsDeployed] = useState(false);
  const router = useRouter();

  const handleStationClick = () => {
    setIsDeployed((prev) => !prev);
  };

  const handleSpaceshipClick = (url: string) => {
    router.push(url);
  };

  return (
    <section className={styles.heroContainer}>
      <BlackholeBackground />
      <PlanetBackground />
      <div className={styles.stationSystem}>
        <motion.button
          className={styles.spaceStation}
          onClick={handleStationClick}
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle spaceships"
        >
          <Image
            src="/spacestation6.png"
            alt="Central space station - click to deploy navigation spaceships"
            fill
            sizes="150px"
            priority
          />
        </motion.button>

        <div className={styles.spaceshipContainer}>
          <AnimatePresence>
            {isDeployed &&
              spaceships.map((ship, index) => (
                <motion.button
                  key={ship.id}
                  onClick={() => handleSpaceshipClick(ship.url)}
                  className={styles.spaceship}
                  title={ship.name}
                  custom={index}
                  variants={spaceshipVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover={{ scale: 1.15, y: -10 }}
                >

                  <motion.div
                    className={styles.fuselage}
                    variants={fuselageVariants}
                    initial="visible"
                    animate="visible"
                    exit="exit"
                  >

                    <div className={`${styles.face} ${styles.front}`}>
                      <Image src={ship.image} alt={`${ship.name} spaceship - navigate to ${ship.name} mode`} fill sizes="80px" />
                    </div>
                    <div className={`${styles.face} ${styles.back}`}>
                      <Image src={ship.imageBack} alt={`${ship.name} (rear view)`} fill sizes="80px" />
                    </div>
                    <div className={`${styles.face} ${styles.right}`}></div>
                    <div className={`${styles.face} ${styles.left}`}></div>
                  </motion.div>
                </motion.button>
              ))}
          </AnimatePresence>
        </div>
      </div>

      <Link href="/" className={styles.wormholeLink} aria-label="Home">
        <motion.div
          className={styles.wormholeImageContainer}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            opacity: { delay: 0.8, duration: 1 },
            scale: { delay: 0.8, duration: 1 },
          }}
          whileHover={{
            scale: 1.15,
            transition: { duration: 0.3 },
          }}
        >
          <Image
            src="/wormhole.png"
            alt="Wormhole portal - navigate to home"
            className={styles.wormholeImage}
            fill
            sizes="100px"
          />
        </motion.div>
        <span className={styles.wormholeText}></span>
      </Link>
    </section>
  );
};

export default Hero;