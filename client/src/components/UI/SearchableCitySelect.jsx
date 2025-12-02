import React from 'react';
import CreatableSelect from 'react-select/creatable';

/**
 * SearchableCitySelect - A reusable searchable dropdown for city selection
 * Supports adding new cities/areas that don't exist in the list
 *
 * @param {Object} props
 * @param {string} props.value - Currently selected city value
 * @param {function} props.onChange - Callback when selection changes (receives city string or '')
 * @param {Array<string>} props.cities - Array of city names to display
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.allOptionLabel - Label for the "all cities" option (default: "جميع المدن")
 * @param {boolean} props.showAllOption - Whether to show "all cities" option (default: true)
 * @param {boolean} props.isClearable - Whether selection can be cleared (default: true)
 * @param {string} props.label - Optional label text
 * @param {boolean} props.disabled - Whether the select is disabled
 * @param {string} props.id - Optional id for accessibility
 * @param {boolean} props.allowCreate - Whether to allow creating new options (default: true)
 */
const SearchableCitySelect = ({
  value,
  onChange,
  cities = [],
  placeholder = 'اختر المدينة أو اكتب للبحث...',
  allOptionLabel = 'جميع المدن',
  showAllOption = true,
  isClearable = true,
  label,
  disabled = false,
  id,
  allowCreate = true,
}) => {
  // Convert cities array to react-select options format
  const options = React.useMemo(() => {
    const cityOptions = cities.map((city) => ({
      value: city,
      label: city,
    }));

    if (showAllOption) {
      return [{ value: '', label: allOptionLabel }, ...cityOptions];
    }

    return cityOptions;
  }, [cities, showAllOption, allOptionLabel]);

  // Find the currently selected option (or create one for custom values)
  const selectedOption = React.useMemo(() => {
    if (!value) {
      return showAllOption ? options[0] : null;
    }
    // Check if value exists in options
    const existingOption = options.find((opt) => opt.value === value);
    if (existingOption) {
      return existingOption;
    }
    // If not found, create a custom option (for user-entered values)
    return { value: value, label: value };
  }, [value, options, showAllOption]);

  // Handle selection change
  const handleChange = (selected) => {
    if (selected) {
      onChange(selected.value);
    } else {
      onChange('');
    }
  };

  // Custom styles with EXPLICIT colors
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '48px',
      border: state.isFocused ? '1px solid #16a34a' : '1px solid #e5e7eb',
      borderRadius: '12px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(22, 163, 74, 0.1)' : 'none',
      backgroundColor: state.isFocused ? '#ffffff' : '#f9fafb',
      fontFamily: '"Cairo", sans-serif',
      fontSize: '16px',
      direction: 'rtl',
      textAlign: 'right',
      cursor: 'text',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: '#16a34a',
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 12px',
      justifyContent: 'flex-start',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#1f2937',
      fontFamily: '"Cairo", sans-serif',
      fontWeight: '500',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af',
      fontFamily: '"Cairo", sans-serif',
    }),
    input: (base) => ({
      ...base,
      color: '#1f2937',
      fontFamily: '"Cairo", sans-serif',
      margin: 0,
      padding: 0,
      opacity: 1,
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 9999,
      direction: 'rtl',
      marginTop: '4px',
    }),
    menuList: (base) => ({
      ...base,
      padding: '4px',
      maxHeight: '250px',
      backgroundColor: '#ffffff',
    }),
    option: (base, state) => {
      // Check if this is the "create new" option
      const isCreateOption = state.data.__isNew__;
      return {
        ...base,
        backgroundColor: isCreateOption
          ? state.isFocused ? '#dcfce7' : '#f0fdf4'
          : state.isSelected ? '#16a34a' : state.isFocused ? '#dcfce7' : '#ffffff',
        color: isCreateOption ? '#16a34a' : state.isSelected ? '#ffffff' : '#374151',
        fontFamily: '"Cairo", sans-serif',
        fontSize: '16px',
        fontWeight: isCreateOption ? '700' : state.isSelected ? '600' : '500',
        padding: '12px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        textAlign: 'right',
        direction: 'rtl',
        borderBottom: isCreateOption ? '2px solid #dcfce7' : 'none',
        marginBottom: isCreateOption ? '4px' : '0',
        '&:active': {
          backgroundColor: state.isSelected ? '#16a34a' : '#dcfce7',
        },
      };
    },
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: '#9ca3af',
      padding: '8px',
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0)',
      transition: 'transform 0.2s ease',
      '&:hover': {
        color: '#16a34a',
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: '#9ca3af',
      padding: '8px',
      cursor: 'pointer',
      '&:hover': {
        color: '#ef4444',
      },
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: '#16a34a',
      fontFamily: '"Cairo", sans-serif',
      fontSize: '14px',
      padding: '16px',
      backgroundColor: '#f0fdf4',
      borderRadius: '8px',
    }),
    loadingMessage: (base) => ({
      ...base,
      color: '#9ca3af',
      fontFamily: '"Cairo", sans-serif',
      backgroundColor: '#ffffff',
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  // Custom filter function that supports Arabic search
  const filterOption = (option, inputValue) => {
    if (!inputValue) return true;
    const label = option.label.toLowerCase();
    const search = inputValue.toLowerCase();
    return label.includes(search);
  };

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px',
            fontFamily: '"Cairo", sans-serif',
            color: '#6b7280',
          }}
        >
          {label}
        </label>
      )}
      <CreatableSelect
        inputId={id}
        value={selectedOption}
        onChange={handleChange}
        options={options}
        styles={customStyles}
        isSearchable={true}
        isClearable={isClearable && value !== ''}
        isDisabled={disabled}
        isRtl={true}
        placeholder={placeholder}
        noOptionsMessage={() => '✨ اكتب اسم المدينة أو المنطقة لإضافتها'}
        loadingMessage={() => 'جاري البحث...'}
        formatCreateLabel={(inputValue) => `➕ إضافة "${inputValue}"`}
        filterOption={filterOption}
        classNamePrefix="city-select"
        menuPlacement="auto"
        menuPosition="fixed"
        menuPortalTarget={document.body}
        menuShouldScrollIntoView={true}
        allowCreateWhileLoading={true}
        createOptionPosition="first"
      />
    </div>
  );
};

export default SearchableCitySelect;
