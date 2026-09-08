import { useCallback, useState } from 'react'

export function useForm(initialValues = {}) {
  const [values, setValues] = useState(initialValues)

  const handleChange = useCallback((event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
  }, [])

  const resetForm = useCallback((nextValues = initialValues) => {
    setValues(typeof nextValues === 'function' ? nextValues : nextValues)
  }, [initialValues])

  return { values, setValues, handleChange, setFieldValue, resetForm }
}
