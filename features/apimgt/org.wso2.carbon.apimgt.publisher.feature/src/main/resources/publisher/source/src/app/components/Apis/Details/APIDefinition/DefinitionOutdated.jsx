/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useState, useContext } from 'react';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import PropTypes from 'prop-types';
import WarningIcon from '@material-ui/icons/Warning';
import Alert from 'AppComponents/Shared/Alert';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import ReactDiffViewer from 'react-diff-viewer';
import DialogTitle from '@material-ui/core/DialogTitle';
import ServiceCatalog from 'AppData/ServiceCatalog';
import Button from '@material-ui/core/Button';
import API from 'AppData/api.js';
import { FormattedMessage } from 'react-intl';

/**
 * This component hosts the Swagger Editor component.
 * Known Issue: The cursor jumps back to the start of the first line when updating the swagger-ui based on the
 * modification done via the editor.
 * https://github.com/wso2/product-apim/issues/5071
 * */
/**
 * Renders an Environments list
 * @class Environments
 * @extends {React.Component}
 */
export default function DefinitionOutdated(props) {
    const {
        api,
        classes,
    } = props;
    const [openImport, setOpenImport] = useState(false);
    const [showDiff, setShowDiff] = useState(false);
    const [newDefinition, setNewDefinition] = useState('');
    const [oldDefinition, setOldDefinition] = useState('');
    const { updateAPI } = useContext(APIContext);
    function reimportService() {
        const promisedReimportService = API.reimportService(api.id);
        promisedReimportService.then(() => {
            Alert.info('Re-import service successfully!');
            setOpenImport(false);
        }).catch((error) => {
            if (error.response) {
                Alert.error(error.response.body.description);
            } else {
                const message = 'Error while Re-import service';
                Alert.error(message);
            }
            console.error(error);
        }).finally(() => {
            updateAPI();
        });
    }

    function showdiff() {
        setShowDiff(true);
        const promisedServices = ServiceCatalog.searchServiceByKey(api.serviceInfo.key);
        promisedServices.then((data) => {
            return ServiceCatalog.getServiceDefinition(data.body.list[0].id).then((file) => {
                setNewDefinition(JSON.stringify(file, null, 2));
            }).catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error('Something went wrong while getting the Service Definition.');
                }
            });
        }).catch((error) => {
            console.error(error);
            Alert.error('ServiceCatalog.Listing.Listing.error.loading');
        });
        api.getSwagger(api.id).then((resp) => {
            setOldDefinition(JSON.stringify(resp.obj, null, 2));
        }).catch((err) => {
            console.err(err);
        });
    }

    const hideDiff = () => {
        setShowDiff(false);
    };

    const handleOpen = () => {
        setOpenImport(true);
    };

    const handleClose = () => {
        setOpenImport(false);
    };

    return (
        <>
            <div>
                <Button
                    size='small'
                    className={classes.button}
                    onClick={handleOpen}
                >
                    <WarningIcon className={classes.buttonWarningColor} />
                    <FormattedMessage
                        id='Apis.Details.APIDefinition.APIDefinition.outdated.definition'
                        defaultMessage='Outdated Definition'
                    />
                </Button>
                <Dialog
                    open={openImport}
                    onClose={handleClose}
                    aria-labelledby='alert-dialog-title'
                    aria-describedby='alert-dialog-description'
                    fullWidth
                    maxWidth='md'
                >
                    <DialogTitle id='alert-dialog-title'>
                        <Typography align='left'>
                            <FormattedMessage
                                id='Apis.Details.APIDefinition.APIDefinition.outdated.api.definition'
                                defaultMessage='Outdated Definition'
                            />
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id='alert-dialog-description'>
                            <FormattedMessage
                                id='Apis.Details.APIDefinition.APIDefinition.api.outdated.definition'
                                defaultMessage='Current API definition outdated,
                                You can either re-import existing
                                resource or create new version'
                            />
                        </DialogContentText>
                        {showDiff && (
                            <ReactDiffViewer
                                oldValue={oldDefinition}
                                newValue={newDefinition}
                                splitView
                                leftTitle='Outdated Definition'
                                rightTitle='New Definition'
                            />
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color='primary'>
                            <FormattedMessage
                                id='Apis.Details.APIDefinition.APIDefinition.btn.cancel'
                                defaultMessage='Cancel'
                            />
                        </Button>
                        {!showDiff ? (
                            <Button onClick={showdiff} color='primary'>
                                <FormattedMessage
                                    id='Apis.Details.APIDefinition.APIDefinition.btn.show.diff'
                                    defaultMessage='Show Diff'
                                />
                            </Button>
                        ) : (
                            <Button onClick={hideDiff} color='primary'>
                                <FormattedMessage
                                    id='Apis.Details.APIDefinition.APIDefinition.btn.hide.diff'
                                    defaultMessage='Hide Diff'
                                />
                            </Button>
                        )}
                        <Button
                            onClick={reimportService}
                            color='primary'
                            autoFocus
                            variant='contained'
                        >
                            <FormattedMessage
                                id='Apis.Details.APIDefinition.APIDefinition.btn.reimport'
                                defaultMessage='Re-import'
                            />
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
}

DefinitionOutdated.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({
        id: PropTypes.string,
    }).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
};
