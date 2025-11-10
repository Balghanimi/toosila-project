import React from 'react';

/**
 * Professional Skeleton Loader Component
 * For loading states
 */
const Skeleton = ({ variant = 'text', width, height, className = '', count = 1, ...props }) => {
  const baseClass = 'skeleton-pro';
  const variantClass = `skeleton-pro-${variant}`;

  const classes = [baseClass, variantClass, className].filter(Boolean).join(' ');

  const style = {
    width,
    height,
  };

  if (count === 1) {
    return <div className={classes} style={style} {...props} />;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={classes} style={style} {...props} />
      ))}
    </>
  );
};

export default Skeleton;
