import styled from '@emotion/styled';
import Button from '@codegouvfr/react-dsfr/Button';

export const DeleteButton = styled(Button)`
    aspect-ratio: 1;
  --border-action-high-blue-france: red;
  display: flex;
  align-items: center;
  justify-content: center;
  &:before {
      --icon-size: 1rem !important;
      margin: 0 !important;
  }
`;