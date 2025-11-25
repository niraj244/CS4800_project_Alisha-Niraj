import React, { useContext, useEffect, useState } from 'react';
import { Button } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { MyContext } from '../../App';
import { fetchDataFromApi, postData } from '../../utils/api';
import CircularProgress from '@mui/material/CircularProgress';
import { FaCheck, FaTimes } from 'react-icons/fa';

const AdminApproval = () => {
    const [adminRequests, setAdminRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const context = useContext(MyContext);

    useEffect(() => {
        getAdminRequests();
    }, []);

    const getAdminRequests = async () => {
        setIsLoading(true);
        try {
            const res = await fetchDataFromApi('/api/user/admin-requests');
            if (res?.error === false && res?.data) {
                setAdminRequests(res.data);
            } else {
                context.alertBox("error", res?.message || "Failed to load admin requests");
            }
        } catch (error) {
            console.error('Error fetching admin requests:', error);
            context.alertBox("error", "Failed to load admin requests");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            const res = await postData(`/api/user/approve-admin/${userId}`);
            if (res?.error === false) {
                context.alertBox("success", res?.message || "Admin access approved successfully");
                getAdminRequests();
            } else {
                context.alertBox("error", res?.message || "Failed to approve admin request");
            }
        } catch (error) {
            console.error('Error approving admin:', error);
            context.alertBox("error", "Failed to approve admin request");
        }
    };

    const handleReject = async (userId) => {
        try {
            const res = await postData(`/api/user/reject-admin/${userId}`);
            if (res?.error === false) {
                context.alertBox("success", res?.message || "Admin request rejected");
                getAdminRequests();
            } else {
                context.alertBox("error", res?.message || "Failed to reject admin request");
            }
        } catch (error) {
            console.error('Error rejecting admin:', error);
            context.alertBox("error", "Failed to reject admin request");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-[20px] font-[600]">Admin Approval Requests</h2>
                <Button 
                    className="btn-blue btn-sm" 
                    onClick={getAdminRequests}
                    disabled={isLoading}
                >
                    Refresh
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                    <CircularProgress />
                </div>
            ) : adminRequests.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500">No pending admin requests</p>
                </div>
            ) : (
                <TableContainer className="bg-white rounded-lg shadow-md">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell className="font-[600]">Name</TableCell>
                                <TableCell className="font-[600]">Email</TableCell>
                                <TableCell className="font-[600]">Requested At</TableCell>
                                <TableCell className="font-[600]">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {adminRequests.map((request) => (
                                <TableRow key={request._id}>
                                    <TableCell>{request.name}</TableCell>
                                    <TableCell>{request.email}</TableCell>
                                    <TableCell>{formatDate(request.requestedAdminAt || request.createdAt)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                className="!bg-green-500 !text-white !min-w-[80px]"
                                                onClick={() => handleApprove(request._id)}
                                                startIcon={<FaCheck />}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                className="!bg-red-500 !text-white !min-w-[80px]"
                                                onClick={() => handleReject(request._id)}
                                                startIcon={<FaTimes />}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
};

export default AdminApproval;

