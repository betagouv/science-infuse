import React, { useState } from 'react';
import styled from '@emotion/styled';
import Button from '@codegouvfr/react-dsfr/Button';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { secondsToTime, TimeCode, timeToSeconds } from "@/lib/utils";

const StyledInput = styled(Input)`
.fr-input-group {
    margin:0;
}
*::-webkit-datetime-edit {
  display: 24-hour;
}
`;

type TimestampInputProps = {
    timestamp?: number;
    onChange: (newTimestamp: number) => void;
};

export const TimestampInput: React.FC<TimestampInputProps> = ({ timestamp, onChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempTime, setTempTime] = useState<TimeCode | null>(timestamp ? secondsToTime(timestamp) : null);

    const handleSave = () => {
        if (!tempTime) return;
        const totalSeconds = timeToSeconds(tempTime.hours, tempTime.minutes, tempTime.seconds);
        onChange(totalSeconds);
        setIsEditing(false);
    };

    return (
        <div className="flex gap-4 items-center">
            {!isEditing ? (
                <Button
                    size='medium'
                    onClick={() => setIsEditing(true)}
                    iconId='fr-icon-timer-line'
                    iconPosition='left'
                    priority="secondary"
                    className='w-[18rem] text-center flex items-center justify-center'
                >
                    {!tempTime ? "Indiquer la position" : `Modifier la position (${String(tempTime.hours).padStart(2, '0')}:${String(tempTime.minutes).padStart(2, '0')}:${String(tempTime.seconds).padStart(2, '0')})`}
                </Button>
            ) : (
                <>
                    <StyledInput
                        label=""
                        className="w-40 !m-0"
                        nativeInputProps={{
                            lang: "fr-FR", // Use a locale that defaults to 24-hour time
                            type: "time",
                            step: "1",
                            value: !tempTime ? "00:00:00" : `${String(tempTime.hours).padStart(2, '0')}:${String(tempTime.minutes).padStart(2, '0')}:${String(tempTime.seconds).padStart(2, '0')}`,
                            onChange: (e) => {
                                const [hours, minutes, seconds] = e.target.value.split(':').map(Number);
                                setTempTime({ hours, minutes, seconds: seconds || 0 });
                            },
                            required: true,
                            pattern: "[0-9]{2}:[0-9]{2}:[0-9]{2}",
                        }}
                    />
                    <Button
                        onClick={handleSave}
                        className='w-30'
                        priority="primary"
                    >
                        Enregistrer
                    </Button>
                </>
            )}
        </div>
    );
};