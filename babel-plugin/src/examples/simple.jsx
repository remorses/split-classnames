import React from 'react';

export default function Component() {
  return (
    <div>
      <p className={`${someClass} ${otherClass}`}></p>
      <p className={`literal-class literal-class-2`}></p>
      <p className={`literal-class ${anotherClass} literal-class-2`}></p>
      <p className={`
        literal-class 
        ${anotherClass} 
        literal-class-2
      `}></p>
      <p className={`${val ? someClass : other} cls ${val && otherClass}`}></p>
      <p className={`${val ? someClass : otherVal ? class1 : class2}`}></p>
    </div>
  );
}