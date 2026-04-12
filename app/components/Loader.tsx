"use client";
import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

export default function Loader({ fullScreen = false }: { fullScreen?: boolean }) {
  const dotVariants = {
    start: {
      y: "0%"
    },
    end: {
      y: "100%"
    }
  };

  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut"
  };

  const containerStyle = fullScreen ? {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    bgcolor: '#fafafa', // Light theme default to match 'white' spaces.
    position: 'fixed' as const,
    top: 0,
    left: 0,
    zIndex: 9999
  } : {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 4
  };

  return (
    <Box sx={containerStyle}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <motion.div
          style={{ width: 8, height: 8, backgroundColor: '#000', borderRadius: '50%', opacity: 0.7 }}
          variants={dotVariants}
          transition={dotTransition}
          initial="start"
          animate="end"
        />
        <motion.div
          style={{ width: 8, height: 8, backgroundColor: '#000', borderRadius: '50%', opacity: 0.7 }}
          variants={dotVariants}
          transition={{ ...dotTransition, delay: 0.2 }}
          initial="start"
          animate="end"
        />
        <motion.div
          style={{ width: 8, height: 8, backgroundColor: '#000', borderRadius: '50%', opacity: 0.7 }}
          variants={dotVariants}
          transition={{ ...dotTransition, delay: 0.4 }}
          initial="start"
          animate="end"
        />
      </Box>
    </Box>
  );
}
