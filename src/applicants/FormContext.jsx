import React, { createContext, useContext, useState } from 'react';

const FormContext = createContext();

export const useFormContext = () => useContext(FormContext);

export const FormProvider = ({ children, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    file: null,
    step2: {},
    step3: {},
    step4: {},
    step5: {},
    step6: {},
    step7: {},
    step8: {},
    step9: {},
    step10: {},
    step11: {}
  });

  const updateFormData = (newData) => {
    const uppercaseStrings = (obj, currentKey = null) => {
      if (typeof obj === 'string') {
        return currentKey === 'email' ? obj : obj.toUpperCase();
      }
      if (Array.isArray(obj)) {
        return obj.map(item => uppercaseStrings(item, currentKey));
      }
      if (obj !== null && typeof obj === 'object') {
        if (obj instanceof File) return obj;
        const newObj = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = uppercaseStrings(obj[key], key);
          }
        }
        return newObj;
      }
      return obj;
    };

    setFormData((prevData) => ({
      ...prevData,
      ...uppercaseStrings(newData),
    }));
  };

  return (
    <FormContext.Provider value={{ formData, updateFormData }}>
      {children}
    </FormContext.Provider>
  );
};
