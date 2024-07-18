import * as React from "react";
import { Button, PageSection, Text, TextContent } from "@patternfly/react-core";
import { PlusIcon } from "@patternfly/react-icons";
import EmptyStatus from "../../components/EmptyStatus";
import { useNavigate } from "react-router-dom";

export interface ISourceProps {
  sampleProp?: string;
}

const Source: React.FunctionComponent<ISourceProps> = () => {
  const navigate = useNavigate();

  const navigateTo = () => {
    navigate("/source/catalog");
  };
  return (
  <>
    <PageSection isWidthLimited>
      <TextContent >
        <Text component="h1">Source</Text>
      </TextContent>
    </PageSection>
    <PageSection>
      <EmptyStatus
        heading="No source available"
        primaryMessage=' No source is configure for this cluster yet. To streams change
              events from a source database you can configure a source by click
              the "Add source" button.'
        secondaryMessage="This text has overridden a css component variable to demonstrate
              how to apply customizations using PatternFly's global
              variable API."
        primaryAction={
          <Button variant="primary" icon={<PlusIcon />} onClick={navigateTo}>
            Add source
          </Button>
        }
        secondaryActions={
          <>
            <Button variant="link">Go to destination</Button>
            <Button variant="link">Configure Vaults</Button>
          </>
        }
      />
    </PageSection>
  </>
)};

export { Source };
