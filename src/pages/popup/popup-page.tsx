import React, { JSX, useState } from 'react';

import logo from '@common/assets/logo.svg';
import { config } from '@common/config';

const Switcher = () => {
  const [isChecked, setIsChecked] = useState(true)

  const handleCheckboxChange = () => {
    console.log(isChecked);
    setIsChecked(!isChecked)
  }

  return (
    <>
      <label className='flex cursor-pointer select-none items-center'>
        <div className='relative'>
          <input
            type='checkbox'
            checked={isChecked}
            onChange={handleCheckboxChange}
            className='peer sr-only'
          />
          <div className='block h-8 rounded-full box bg-dark dark:bg-dark-2 w-14 peer-checked:bg-primary'></div>
          <div className='absolute w-6 h-6 transition bg-white rounded-full dot dark:bg-dark-4 left-1 top-1 peer-checked:translate-x-full peer-checked:bg-primary'></div>
        </div>
      </label>
    </>
  )
}

export function PopupPage(): JSX.Element {
  return (
    <div className="wrapper">
      <h2>Popup page</h2>
      <h3>SCSS</h3>
      <Switcher />
      <img src={logo} width={48} height={48} />
      <center>{config.someKey}</center>
    </div>
  );
}
