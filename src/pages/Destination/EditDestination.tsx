/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import {
  ActionGroup,
  Button,
  ButtonType,
  Card,
  CardBody,
  Form,
  FormContextProvider,
  FormFieldGroup,
  FormFieldGroupHeader,
  FormGroup,
  FormHelperText,
  Grid,
  HelperText,
  HelperTextItem,
  PageSection,
  Split,
  SplitItem,
  Text,
  TextContent,
  TextInput,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import {
  PencilAltIcon,
  CodeIcon,
  PlusIcon,
  TrashIcon,
  ExclamationCircleIcon,
} from "@patternfly/react-icons";
import ConnectorImage from "../../components/ComponentImage";
import { useNavigate, useParams } from "react-router-dom";
import "./CreateDestination.css";
import { CodeEditor, Language } from "@patternfly/react-code-editor";
import { useState } from "react";
import {
  Destination,
  DestinationConfig,
  editPut,
  fetchDataTypeTwo,
} from "../../apis/apis";
import { API_URL } from "../../utils/constants";
import { convertMapToObject, getConnectorTypeName } from "../../utils/helpers";
import { useData } from "../../appLayout/AppContext";
import { useNotification } from "../../appLayout/NotificationContext";

const EditDestination: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const { destinationId } = useParams<{ destinationId: string }>();

  const navigateTo = (url: string) => {
    navigate(url);
  };

  const { navigationCollapsed } = useData();

  const { addNotification } = useNotification();

  const [editorSelected, setEditorSelected] = React.useState("form-editor");

  const [destination, setDestination] = useState<Destination>();
  const [isFetchLoading, setIsFetchLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [properties, setProperties] = useState<
    Map<string, { key: string; value: string }>
  >(new Map([["key0", { key: "", value: "" }]]));
  const [keyCount, setKeyCount] = useState<number>(1);

  const setConfigProperties = (configProp: DestinationConfig) => {
    let i = 0;
    const configMap = new Map();
    for (const config in configProp) {
      configMap.set(`key${i}`, { key: config, value: configProp[config] });
      i++;
    }
    setProperties(configMap);
  };

  React.useEffect(() => {
    const fetchDestinations = async () => {
      setIsFetchLoading(true);
      const response = await fetchDataTypeTwo<Destination>(
        `${API_URL}/api/destinations/${destinationId}`
      );

      if (response.error) {
        setError(response.error);
      } else {
        setDestination(response.data as Destination);
        setConfigProperties(response.data?.config ?? { "": "" });
      }

      setIsFetchLoading(false);
    };

    fetchDestinations();
  }, [destinationId]);

  const handleAddProperty = () => {
    const newKey = `key${keyCount}`;
    setProperties(
      (prevProperties) =>
        new Map(prevProperties.set(newKey, { key: "", value: "" }))
    );
    setKeyCount((prevCount) => prevCount + 1);
  };

  const handleDeleteProperty = (key: string) => {
    setProperties((prevProperties) => {
      const newProperties = new Map(prevProperties);
      newProperties.delete(key);
      return newProperties;
    });
  };

  const handlePropertyChange = (
    key: string,
    type: "key" | "value",
    newValue: string
  ) => {
    setProperties((prevProperties) => {
      const newProperties = new Map(prevProperties);
      const property = newProperties.get(key);
      if (property) {
        if (type === "key") property.key = newValue;
        else if (type === "value") property.value = newValue;
        newProperties.set(key, property);
      }
      return newProperties;
    });
  };

  const editDestination = async (values: Record<string, string>) => {
    const payload = {
      description: values["details"],
      config: convertMapToObject(properties),
      name: values["destination-name"],
    };

    const response = await editPut(
      `${API_URL}/api/destinations/${destinationId}`,
      payload
    );

    if (response.error) {
      addNotification(
        "danger",
        `Edit failed`,
        `Failed to edit ${(response.data as Destination).name}: ${response.error}`
      );
    } else {
      addNotification(
        "success",
        `Edit successful`,
        `Destination "${(response.data as Destination).name}" edited successfully.`
      );
    }
  };

  const handleEditDestination = (values: Record<string, string>) => {
    setIsLoading(true);
     // TODO - Remove after demo: Add a 2-second delay
    setTimeout(async () => {
      await editDestination(values);
      setIsLoading(false);
      navigateTo("/destination");
    }, 2000);
  };

  const handleItemClick = (
    event:
      | MouseEvent
      | React.MouseEvent<any, MouseEvent>
      | React.KeyboardEvent<Element>
  ) => {
    const id = event.currentTarget.id;
    setEditorSelected(id);
  };

  if (isFetchLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <PageSection isWidthLimited>
        <TextContent style={{ marginBlockEnd: "10px" }}>
          <Text component="h1">Edit destination </Text>
          <Text component="p">
            To configure and create a connector fill out the below form or use
            the smart editor to setup a new Destination connector. If you
            already have a configuration file, you can setup a new Destination
            connector by uploading it in the smart editor.
          </Text>
        </TextContent>
        <Toolbar id="edit-editor-toggle" className="create_destination-toolbar">
          <ToolbarContent style={{ padding: "0" }}>
            <ToolbarItem>
              <ToggleGroup aria-label="Toggle between form editor and smart editor">
                <ToggleGroupItem
                  icon={<PencilAltIcon />}
                  text="Form editor"
                  aria-label="Form editor"
                  buttonId="form-editor"
                  isSelected={editorSelected === "form-editor"}
                  onChange={handleItemClick}
                />

                <ToggleGroupItem
                  icon={<CodeIcon />}
                  text="Smart editor"
                  aria-label="Smart editor"
                  buttonId="smart-editor"
                  isSelected={editorSelected === "smart-editor"}
                  onChange={handleItemClick}
                />
              </ToggleGroup>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </PageSection>

      <FormContextProvider
        initialValues={{
          "destination-name": destination?.name || "",
          details: destination?.description || "",
        }}
      >
        {({ setValue, getValue, setError, values, errors }) => (
          <>
            <PageSection
              isWidthLimited={editorSelected === "form-editor"}
              isCenterAligned
              isFilled
              style={{ paddingTop: "0" }}
              className={navigationCollapsed ? "custom-page-section" : ""}
              // To do: Add custom class to the pf-v6-c-page__main-body for center alignment in collapsed navigation
              // className="custom-card-body"
            >
              {editorSelected === "form-editor" ? (
                <Card className="custom-card-body">
                  <CardBody isFilled>
                    <Form isWidthLimited>
                      <FormGroup
                        label="Destination type"
                        isRequired
                        fieldId="destination-type-field"
                      >
                        <TextContent
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <ConnectorImage
                            connectorType={destination?.type ?? ""}
                            size={35}
                          />

                          <Text component="p" style={{ paddingLeft: "10px" }}>
                            {getConnectorTypeName(destinationId || "")}
                          </Text>
                        </TextContent>
                      </FormGroup>
                      <FormGroup
                        label="Destination name"
                        isRequired
                        fieldId="destination-name-field"
                      >
                        <TextInput
                          id="destination-name"
                          aria-label="Destination name"
                          onChange={(_event, value) => {
                            setValue("destination-name", value);
                            setError("destination-name", undefined);
                          }}
                          value={getValue("destination-name")}
                          validated={
                            errors["destination-name"] ? "error" : "default"
                          }
                        />
                        <FormHelperText>
                          <HelperText>
                            <HelperTextItem
                              variant={
                                errors["destination-name"] ? "error" : "default"
                              }
                              {...(errors["destination-name"] && {
                                icon: <ExclamationCircleIcon />,
                              })}
                            >
                              {errors["destination-name"]}
                            </HelperTextItem>
                          </HelperText>
                        </FormHelperText>
                      </FormGroup>
                      <FormGroup label="Details" fieldId="details-field">
                        <TextInput
                          id="details"
                          aria-label="Destination details"
                          onChange={(_event, value) =>
                            setValue("details", value)
                          }
                          value={getValue("details")}
                        />
                        <FormHelperText>
                          <HelperText>
                            <HelperTextItem>
                              Add a one liner to describe your Destination or
                              where you plan to capture.
                            </HelperTextItem>
                          </HelperText>
                        </FormHelperText>
                      </FormGroup>

                      <FormFieldGroup
                        // className="custom-form-group"
                        header={
                          <FormFieldGroupHeader
                            titleText={{
                              text: (
                                <Text component="h4">
                                  Configuration properties
                                </Text>
                              ),
                              id: "configuration-properties-group",
                            }}
                            titleDescription="Enter the both key and value pair to configure a property"
                            actions={
                              <>
                                <Button
                                  variant="secondary"
                                  icon={<PlusIcon />}
                                  onClick={handleAddProperty}
                                >
                                  Add property
                                </Button>
                              </>
                            }
                          />
                        }
                      >
                        {Array.from(properties.keys()).map((key) => (
                          <Split hasGutter key={key}>
                            <SplitItem isFilled>
                              <Grid hasGutter md={6}>
                                <FormGroup
                                  label=""
                                  isRequired
                                  fieldId={`configuration-properties-key-field-${key}`}
                                >
                                  <TextInput
                                    isRequired
                                    type="text"
                                    placeholder="Key"
                                    id={`configuration-properties-key-${key}`}
                                    name={`configuration-properties-key-${key}`}
                                    value={properties.get(key)?.key || ""}
                                    onChange={(_e, value) =>
                                      handlePropertyChange(key, "key", value)
                                    }
                                  />
                                </FormGroup>
                                <FormGroup
                                  label=""
                                  isRequired
                                  fieldId={`configuration-properties-value-field-${key}`}
                                >
                                  <TextInput
                                    isRequired
                                    type="text"
                                    id={`configuration-properties-value-${key}`}
                                    placeholder="Value"
                                    name={`configuration-properties-value-${key}`}
                                    value={properties.get(key)?.value || ""}
                                    onChange={(_e, value) =>
                                      handlePropertyChange(key, "value", value)
                                    }
                                  />
                                </FormGroup>
                              </Grid>
                            </SplitItem>
                            <SplitItem>
                              <Button
                                variant="plain"
                                aria-label="Remove property"
                                onClick={() => handleDeleteProperty(key)}
                              >
                                <TrashIcon />
                              </Button>
                            </SplitItem>
                          </Split>
                        ))}
                      </FormFieldGroup>
                    </Form>
                  </CardBody>
                </Card>
              ) : (
                <CodeEditor
                  isUploadEnabled
                  isDownloadEnabled
                  isCopyEnabled
                  isLanguageLabelVisible
                  isMinimapVisible
                  language={Language.yaml}
                  // code="your code goes here"
                  height="450px"
                  // className="custom-card-body"
                />
              )}
            </PageSection>
            <PageSection className="pf-m-sticky-bottom" isFilled={false}>
              <ActionGroup style={{ marginTop: 0 }}>
                <Button
                  variant="primary"
                  // onClick={handleCreateSource}
                  isLoading={isLoading}
                  isDisabled={isLoading}
                  type={ButtonType.submit}
                  onClick={(e) => {
                    e.preventDefault();

                    if (!values["destination-name"]) {
                      setError(
                        "destination-name",
                        "Destination name is required."
                      );
                    } else {
                      handleEditDestination(values);
                    }
                  }}
                >
                  Save change
                </Button>
                <Button
                  variant="link"
                  onClick={() => navigateTo("/destination")}
                >
                  Cancel
                </Button>
              </ActionGroup>
            </PageSection>
          </>
        )}
      </FormContextProvider>
    </>
  );
};

export { EditDestination };
