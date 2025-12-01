import React from 'react';
import Select from 'react-select';

/**
 * SearchableCitySelect - A reusable searchable dropdown for city selection
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

  // Find the currently selected option
  const selectedOption = React.useMemo(() => {
    if (!value) {
      return showAllOption ? options[0] : null;
    }
    return options.find((opt) => opt.value === value) || null;
  }, [value, options, showAllOption]);

  // Handle selection change
  const handleChange = (selected) => {
    if (selected) {
      onChange(selected.value);
    } else {
      onChange('');
    }
  };

  // Custom styles to match existing app design
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '48px',
      border: state.isFocused
        ? '2px solid var(--primary, #10b981)'
        : '2px solid var(--border-light)',
      borderRadius: 'var(--radius, 8px)',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none',
      backgroundColor: 'var(--surface-primary, #fff)',
      fontFamily: '"Cairo", sans-serif',
      fontSize: 'var(--text-base, 16px)',
      direction: 'rtl',
      textAlign: 'right',
      cursor: 'pointer',
      '&:hover': {
        borderColor: 'var(--primary, #10b981)',
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 var(--space-3, 12px)',
      justifyContent: 'flex-start',
    }),
    singleValue: (base) => ({
      ...base,
      color: 'var(--text-primary, #1f2937)',
      fontFamily: '"Cairo", sans-serif',
      fontWeight: '500',
    }),
    placeholder: (base) => ({
      ...base,
      color: 'var(--text-muted, #9ca3af)',
      fontFamily: '"Cairo", sans-serif',
    }),
    input: (base) => ({
      ...base,
      color: 'var(--text-primary, #1f2937)',
      fontFamily: '"Cairo", sans-serif',
      margin: 0,
      padding: 0,
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'var(--surface-primary, #fff)',
      border: '2px solid var(--border-light)',
      borderRadius: 'var(--radius, 8px)',
      boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))',
      zIndex: 9999,
      direction: 'rtl',
      marginTop: '4px',
    }),
    menuList: (base) => ({
      ...base,
      padding: 'var(--space-1, 4px)',
      maxHeight: '250px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? 'var(--primary, #10b981)'
        : state.isFocused
          ? 'var(--surface-secondary, #f3f4f6)'
          : 'transparent',
      color: state.isSelected ? '#fff' : 'var(--text-primary, #1f2937)',
      fontFamily: '"Cairo", sans-serif',
      fontSize: 'var(--text-base, 16px)',
      fontWeight: state.isSelected ? '600' : '500',
      padding: 'var(--space-3, 12px) var(--space-4, 16px)',
      borderRadius: 'var(--radius-sm, 6px)',
      cursor: 'pointer',
      textAlign: 'right',
      direction: 'rtl',
      '&:active': {
        backgroundColor: state.isSelected
          ? 'var(--primary, #10b981)'
          : 'var(--surface-secondary, #f3f4f6)',
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: 'var(--text-secondary, #6b7280)',
      padding: 'var(--space-2, 8px)',
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0)',
      transition: 'transform 0.2s ease',
      '&:hover': {
        color: 'var(--primary, #10b981)',
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: 'var(--text-muted, #9ca3af)',
      padding: 'var(--space-2, 8px)',
      '&:hover': {
        color: 'var(--danger, #ef4444)',
      },
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: 'var(--text-muted, #9ca3af)',
      fontFamily: '"Cairo", sans-serif',
      fontSize: 'var(--text-sm, 14px)',
      padding: 'var(--space-4, 16px)',
    }),
    loadingMessage: (base) => ({
      ...base,
      color: 'var(--text-muted, #9ca3af)',
      fontFamily: '"Cairo", sans-serif',
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
            fontSize: 'var(--text-sm)',
            fontWeight: '600',
            marginBottom: 'var(--space-2)',
            fontFamily: '"Cairo", sans-serif',
            color: 'var(--text-secondary)',
          }}
        >
          {label}
        </label>
      )}
      <Select
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
        noOptionsMessage={() => 'لا توجد نتائج'}
        loadingMessage={() => 'جاري البحث...'}
        filterOption={filterOption}
        classNamePrefix="city-select"
        menuPlacement="auto"
        menuPosition="fixed"
        menuShouldScrollIntoView={true}
      />
    </div>
  );
};

export default SearchableCitySelect;
