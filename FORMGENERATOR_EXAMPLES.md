# FormGenerator - Dependent Dropdown Examples

## ✅ YES! FormGenerator supports dependent dropdowns

The `fields` array is recreated on every render, so when state changes, the dropdowns automatically update with new options.

## Example 1: State → District (Classic Dependent Dropdown)

```typescript
const MyForm = () => {
  const [formData, setFormData] = useState({ state: '', district: '' })
  
  // Fetch states list
  const { data: statesList } = useGetStatesListQuery()
  
  // Lazy fetch districts based on selected state
  const [fetchDistricts, { data: districtsList, isFetching }] = useLazyGetDistrictsListQuery()
  
  const handleChange = (field: string) => (event: any) => {
    const value = event.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // When state changes, fetch districts for that state
    if (field === 'state') {
      fetchDistricts(value)
      // Clear district selection when state changes
      setFormData(prev => ({ ...prev, district: '' }))
    }
  }
  
  const fields: InputFields[] = [
    {
      type: InputTypes.SELECT,
      id: 'state',
      key: 'state',
      label: 'State',
      value: formData.state,
      onChange: handleChange('state'),
      menuOptions: (statesList ?? []).map(s => ({ 
        value: s.state_id, 
        label: s.state_name 
      }))
    },
    {
      type: InputTypes.SELECT,
      id: 'district',
      key: 'district',
      label: 'District',
      value: formData.district,
      onChange: handleChange('district'),
      // ✅ Disabled until state is selected
      isDisabled: !formData.state,
      // ✅ Shows loading while fetching
      isLoading: isFetching,
      // ✅ Options filtered based on selected state
      menuOptions: (districtsList ?? []).map(d => ({ 
        value: d.district_id, 
        label: d.district_name 
      }))
    }
  ]
  
  return <FormGenerator fields={fields} />
}
```

## Example 2: Program → Section → Student (Multi-level Dependency)

```typescript
const StudentForm = () => {
  const [formData, setFormData] = useState({ 
    program: '', 
    section: '', 
    student: '' 
  })
  
  const { data: programs } = useGetProgramsQuery()
  const { data: sections } = useGetSectionsQuery(formData.program, {
    skip: !formData.program // Only fetch when program is selected
  })
  const { data: students } = useGetStudentsQuery(
    { program: formData.program, section: formData.section },
    { skip: !formData.section } // Only fetch when section is selected
  )
  
  const handleChange = (field: string) => (event: any) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }))
    
    // Reset dependent fields when parent changes
    if (field === 'program') {
      setFormData(prev => ({ ...prev, section: '', student: '' }))
    }
    if (field === 'section') {
      setFormData(prev => ({ ...prev, student: '' }))
    }
  }
  
  const fields: InputFields[] = [
    {
      type: InputTypes.SELECT,
      id: 'program',
      key: 'program',
      label: 'Program',
      value: formData.program,
      onChange: handleChange('program'),
      menuOptions: programs?.map(p => ({ value: p.id, label: p.name }))
    },
    {
      type: InputTypes.SELECT,
      id: 'section',
      key: 'section',
      label: 'Section',
      value: formData.section,
      onChange: handleChange('section'),
      isDisabled: !formData.program, // ✅ Disabled until program selected
      menuOptions: sections?.map(s => ({ value: s.id, label: s.name }))
    },
    {
      type: InputTypes.SELECT,
      id: 'student',
      key: 'student',
      label: 'Student',
      value: formData.student,
      onChange: handleChange('student'),
      isDisabled: !formData.section, // ✅ Disabled until section selected
      menuOptions: students?.map(st => ({ value: st.id, label: st.name }))
    }
  ]
  
  return <FormGenerator fields={fields} />
}
```

## Example 3: Conditional Field Visibility

```typescript
const ConditionalForm = () => {
  const [formData, setFormData] = useState({ 
    hasAddress: false, 
    country: '', 
    state: '' 
  })
  
  const fields: InputFields[] = [
    {
      type: InputTypes.CHECKBOX,
      id: 'hasAddress',
      key: 'hasAddress',
      label: 'I have a permanent address',
      value: formData.hasAddress,
      onChange: (e) => setFormData(prev => ({ 
        ...prev, 
        hasAddress: e.target.checked 
      }))
    },
    // ✅ Only show these fields if checkbox is checked
    ...(formData.hasAddress ? [
      {
        type: InputTypes.SELECT,
        id: 'country',
        key: 'country',
        label: 'Country',
        value: formData.country,
        onChange: handleChange('country'),
        menuOptions: countries
      },
      {
        type: InputTypes.SELECT,
        id: 'state',
        key: 'state',
        label: 'State',
        value: formData.state,
        onChange: handleChange('state'),
        isDisabled: !formData.country,
        menuOptions: states?.filter(s => s.country === formData.country)
      }
    ] : [])
  ]
  
  return <FormGenerator fields={fields} />
}
```

## Example 4: Dynamic Options Filtering

```typescript
const FilteredOptionsForm = () => {
  const [formData, setFormData] = useState({ 
    category: '', 
    subcategory: '' 
  })
  
  const { data: allSubcategories } = useGetSubcategoriesQuery()
  
  const fields: InputFields[] = [
    {
      type: InputTypes.SELECT,
      id: 'category',
      key: 'category',
      label: 'Category',
      value: formData.category,
      onChange: handleChange('category'),
      menuOptions: [
        { value: 'tech', label: 'Technology' },
        { value: 'arts', label: 'Arts' },
        { value: 'science', label: 'Science' }
      ]
    },
    {
      type: InputTypes.SELECT,
      id: 'subcategory',
      key: 'subcategory',
      label: 'Subcategory',
      value: formData.subcategory,
      onChange: handleChange('subcategory'),
      isDisabled: !formData.category,
      // ✅ Filter options based on selected category
      menuOptions: (allSubcategories ?? [])
        .filter(sub => sub.category === formData.category)
        .map(sub => ({ value: sub.id, label: sub.name }))
    }
  ]
  
  return <FormGenerator fields={fields} />
}
```

## Key Principles:

1. **Reactive by Default**: The `fields` array is recreated on every render, so changes to state automatically update the form
2. **Use `isDisabled`**: Disable dependent fields until their parent is selected
3. **Use `isLoading`**: Show loading state while fetching dependent data
4. **Filter `menuOptions`**: Filter options based on parent field values
5. **Reset Dependent Fields**: Clear child field values when parent changes
6. **Conditional Rendering**: Use spread operator to conditionally include/exclude fields
7. **Trigger Side Effects in `handleChange`**: Fetch data or update state when specific fields change

## ✅ Summary

**YES!** FormGenerator fully supports:
- ✅ Dependent dropdowns (State → District)
- ✅ Multi-level dependencies (Program → Section → Student)
- ✅ Conditional field visibility
- ✅ Dynamic option filtering
- ✅ Loading states
- ✅ Disabled states based on dependencies
- ✅ Cascading resets when parent changes
