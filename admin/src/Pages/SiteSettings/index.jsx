import React, { useState, useContext, useEffect } from 'react';
import { Button } from '@mui/material';
import { MyContext } from '../../App';
import { fetchDataFromApi, editData, postData } from '../../utils/api';
import CircularProgress from '@mui/material/CircularProgress';

const SiteSettings = () => {
    const [popularProductsSubtitle, setPopularProductsSubtitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [isRequestingAdmin, setIsRequestingAdmin] = useState(false);

    const context = useContext(MyContext);

    useEffect(() => {
        fetchDataFromApi(`/api/siteSettings`).then((res) => {
            if (res?.error === false && res?.data) {
                setPopularProductsSubtitle(res?.data?.popularProductsSubtitle || '');
            }
            setIsFetching(false);
        }).catch(() => {
            setIsFetching(false);
        });
    }, []);

    const handleRequestAdmin = async () => {
        setIsRequestingAdmin(true);
        try {
            const res = await postData('/api/user/request-admin');
            if (res?.error === false) {
                context.alertBox("success", res?.message || "Admin request submitted successfully. Waiting for approval.");
                const userRes = await fetchDataFromApi('/api/user/user-details');
                if (userRes?.data) {
                    context.setUserData(userRes.data);
                }
            } else {
                context.alertBox("error", res?.message || "Failed to submit admin request");
            }
        } catch (error) {
            console.error('Error requesting admin:', error);
            context.alertBox("error", "Failed to submit admin request");
        } finally {
            setIsRequestingAdmin(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!popularProductsSubtitle.trim()) {
            context.alertBox("error", "Please enter the subtitle text");
            return false;
        }

        setIsLoading(true);

        editData(`/api/siteSettings/update`, {
            popularProductsSubtitle: popularProductsSubtitle.trim()
        }).then((res) => {
            if (res?.data?.error === false) {
                context.alertBox("success", res?.data?.message || "Site settings updated successfully");
            } else {
                context.alertBox("error", res?.data?.message || "Failed to update settings");
            }
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        }).catch(() => {
            context.alertBox("error", "Failed to update settings");
            setIsLoading(false);
        });
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <CircularProgress />
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between px-2 py-0 mt-3">
                <h2 className="text-[18px] font-[600]">
                    Site Settings
                </h2>
            </div>

            <form className='form py-1 md:p-3 md:py-1' onSubmit={handleSubmit}>
                <div className="card my-4 pt-5 pb-5 shadow-md sm:rounded-lg bg-white w-[100%] sm:w-[100%] lg:w-[65%] p-5">
                    <div className='col mb-4'>
                        <h3 className='text-[14px] font-[500] mb-1 text-black'>Popular Products Subtitle</h3>
                        <p className='text-[12px] text-gray-500 mb-2'>This text appears below "Popular Products" heading on the home page.</p>
                        <input
                            type="text"
                            className='w-full h-[40px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm'
                            name="popularProductsSubtitle"
                            value={popularProductsSubtitle}
                            onChange={(e) => setPopularProductsSubtitle(e.target.value)}
                            placeholder="Do not miss the current offers until the end of March."
                        />
                    </div>

                    <br />

                    <Button type="submit" className="btn-blue btn-lg w-full flex gap-2" disabled={isLoading}>
                        {
                            isLoading === true ? (
                                <CircularProgress color="inherit" size={20} />
                            ) : (
                                "Save Settings"
                            )
                        }
                    </Button>
                </div>
            </form>

            {context?.userData?.role !== "ADMIN" && (
                <div className="card my-4 pt-5 pb-5 shadow-md sm:rounded-lg bg-white w-[100%] sm:w-[100%] lg:w-[65%] p-5">
                    <h3 className='text-[16px] font-[600] mb-3 text-black'>Admin Access Request</h3>
                    <p className='text-[14px] text-gray-600 mb-4'>
                        Request admin privileges to manage products, categories, orders, and other site settings. 
                        Your request will be reviewed by the super admin.
                    </p>
                    
                    {context?.userData?.adminRequestStatus === 'pending' ? (
                        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <div className="flex-1">
                                <p className="text-[14px] font-[500] text-yellow-800">Admin Request Pending</p>
                                <p className="text-[12px] text-yellow-600 mt-1">Your request is being reviewed. You will be notified once it's approved.</p>
                            </div>
                            <CircularProgress size={24} className="text-yellow-600" />
                        </div>
                    ) : context?.userData?.adminRequestStatus === 'approved' ? (
                        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-[14px] font-[500] text-green-800">✓ Admin Access Approved</p>
                        </div>
                    ) : context?.userData?.adminRequestStatus === 'rejected' ? (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-md mb-3">
                            <p className="text-[14px] font-[500] text-red-800">Admin Request Rejected</p>
                        </div>
                    ) : null}

                    {context?.userData?.adminRequestStatus !== 'pending' && context?.userData?.adminRequestStatus !== 'approved' && (
                        <Button 
                            className="btn-blue btn-lg w-full flex gap-2" 
                            onClick={handleRequestAdmin}
                            disabled={isRequestingAdmin}
                        >
                            {
                                isRequestingAdmin ? (
                                    <>
                                        <CircularProgress color="inherit" size={20} />
                                        Submitting...
                                    </>
                                ) : (
                                    "Request Admin Access"
                                )
                            }
                        </Button>
                    )}
                </div>
            )}
        </>
    );
};

export default SiteSettings;

