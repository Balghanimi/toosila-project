import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const DateTimeSelector = ({ date, time, onDateChange, onTimeChange, errors = {} }) => {
  const [showTimeSuggestions, setShowTimeSuggestions] = useState(false);
  const { t } = useLanguage();

  const quickDates = [
    { key: 'today', label: t('today'), icon: '📅', value: new Date().toISOString().split('T')[0] },
    {
      key: 'tomorrow',
      label: t('tomorrow'),
      icon: '📆',
      value: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  ];

  const timeSuggestions = ['06:00', '07:00', '08:00', '09:00', '10:00', '14:00', '16:00', '18:00'];

  return (
    <div
      style={{
        background: 'var(--surface-secondary)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        border: '1px solid var(--border-light)',
      }}
    >
      <h3
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-4)',
          fontFamily: '"Cairo", sans-serif',
        }}
      >
        📅 {t('date')} {t('time')}
      </h3>

      {/* Quick Date Selection */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-4)',
        }}
      >
        {quickDates.map((option) => {
          const isSelected = date === option.value;

          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onDateChange(option.value)}
              style={{
                flex: 1,
                padding: 'var(--space-3)',
                border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius)',
                background: isSelected ? 'var(--primary)' : 'var(--surface-primary)',
                color: isSelected ? 'white' : 'var(--text-secondary)',
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'var(--transition)',
                fontFamily: '"Cairo", sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-1)',
              }}
            >
              <span>{option.icon}</span>
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Date and Time Inputs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-2)',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            {t('date')}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              border: `2px solid ${errors.date ? 'var(--error)' : 'var(--border-light)'}`,
              borderRadius: 'var(--radius)',
              fontSize: 'var(--text-base)',
              background: 'var(--surface-primary)',
              color: 'var(--text-primary)',
              fontFamily: '"Cairo", sans-serif',
              transition: 'var(--transition)',
              outline: 'none',
            }}
          />
          {errors.date && (
            <p
              style={{
                color: 'var(--error)',
                fontSize: 'var(--text-sm)',
                marginTop: 'var(--space-1)',
              }}
            >
              {errors.date}
            </p>
          )}
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-2)',
              fontFamily: '"Cairo", sans-serif',
            }}
          >
            {t('time')}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                border: `2px solid ${errors.time ? 'var(--error)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius)',
                fontSize: 'var(--text-base)',
                background: 'var(--surface-primary)',
                color: 'var(--text-primary)',
                fontFamily: '"Cairo", sans-serif',
                transition: 'var(--transition)',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setShowTimeSuggestions(!showTimeSuggestions)}
              style={{
                position: 'absolute',
                left: 'var(--space-2)',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-1)',
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              ⏰
            </button>
          </div>
          {errors.time && (
            <p
              style={{
                color: 'var(--error)',
                fontSize: 'var(--text-sm)',
                marginTop: 'var(--space-1)',
              }}
            >
              {errors.time}
            </p>
          )}
        </div>
      </div>

      {/* Time Suggestions */}
      {showTimeSuggestions && (
        <div
          style={{
            background: 'var(--surface-primary)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-3)',
            border: '1px solid var(--border-light)',
            marginTop: 'var(--space-3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-2)',
            }}
          >
            <label
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                fontFamily: '"Cairo", sans-serif',
              }}
            >
              {t('suggestedTimes')}
            </label>
            <button
              type="button"
              onClick={() => setShowTimeSuggestions(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 'var(--text-lg)',
              }}
            >
              ×
            </button>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
              gap: 'var(--space-2)',
            }}
          >
            {timeSuggestions.map((timeOption) => (
              <button
                key={timeOption}
                type="button"
                onClick={() => {
                  onTimeChange(timeOption);
                  setShowTimeSuggestions(false);
                }}
                style={{
                  padding: 'var(--space-2)',
                  border: `2px solid ${time === timeOption ? 'var(--primary)' : 'var(--border-light)'}`,
                  borderRadius: 'var(--radius)',
                  background: time === timeOption ? 'var(--primary)' : 'var(--surface-secondary)',
                  color: time === timeOption ? 'white' : 'var(--text-secondary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  fontFamily: '"Cairo", sans-serif',
                }}
              >
                {timeOption}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Selection Display */}
      <div
        style={{
          marginTop: 'var(--space-4)',
          padding: 'var(--space-3)',
          background: 'var(--surface-primary)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-light)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: '600',
            color: 'var(--text-primary)',
            fontFamily: '"Cairo", sans-serif',
          }}
        >
          📅{' '}
          {new Date(date).toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
        <div
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--text-secondary)',
            fontFamily: '"Cairo", sans-serif',
            marginTop: 'var(--space-1)',
          }}
        >
          ⏰ {time}
        </div>
      </div>
    </div>
  );
};

export default DateTimeSelector;
