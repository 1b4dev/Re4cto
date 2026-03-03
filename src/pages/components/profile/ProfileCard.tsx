import { useState, memo } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Placeholder from 'react-bootstrap/Placeholder';

interface ProfileCardProps {
  label: string;
  value: string | undefined;
  isFirst?: boolean;
  loading: boolean;
}

function ProfileCard({ label, value, isFirst = false, loading }: ProfileCardProps) {
  const [randomWidth] = useState(() => Math.floor(Math.random() * (6 - 3 + 1)) + 3);

  return(
    <Row className={isFirst ? "" : "pt-3 border-top"}>
      <Col sm={3}>
        <p className="text-muted">{label}</p>
      </Col>
      <Col sm={9}>
        {loading ? (
          <Placeholder animation="glow">
            <Placeholder className="mb-3" xs={randomWidth} />
          </Placeholder>
        ) : (
          <p>{value ? value : "N/A"}</p>
        )}
      </Col>
    </Row>
  )
}

ProfileCard.displayName = 'ProfileCard';

export default memo(ProfileCard);