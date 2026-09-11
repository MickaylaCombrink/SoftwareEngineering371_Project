export default function AdminPanel() {
  return (
    <div className="flex items-start bg-[#2A2623] min-w-screen min-h-screen overflow-hidden">
      <div className="flex pt-7 pr-5 pb-6 pl-5 flex-col justify-between items-start shrink-0 border-r border-r-[#453E37] bg-[#1E1B18] w-60 h-full">
        <div className="flex flex-col items-start gap-7 w-full">
          <div className="flex flex-col items-start gap-2.5 w-full">
            <p className="text-[#D9BC7E] font-cormorantGaramond text-[22px] font-semibold w-fit tracking-[0.16em]">
              SCENTIQUE
            </p>
              <p className="text-[#C9973F] font-jost text-[10px] font-medium w-fit tracking-[0.2em]">
              Admin
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 w-full">
            <div className="flex py-0 px-5 items-center gap-3 border-l-2 border-l-[#C9973F] bg-[#3A332B] w-full h-[46px]">
              <div className="w-[17px] h-[17px] overflow-hidden relative">
                <svg
                  width="7"
                  height="8"
                  viewBox="0 0 7 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[5px] h-1.5 absolute left-0.5 top-0.5 "
                >
                  <path
                    d="M5.48836 0.530029H0.530029V6.90503H5.48836V0.530029Z"
                    stroke="#F0DCAE"
                    strokeWidth="1.06"
                  />
                </svg>
                <svg
                  width="7"
                  height="5"
                  viewBox="0 0 7 5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[5px] h-1 absolute left-2.5 top-0.5 "
                >
                  <path
                    d="M5.48836 0.530029H0.530029V4.0717H5.48836V0.530029Z"
                    stroke="#F0DCAE"
                    strokeWidth="1.06"
                  />
                </svg>
                <svg
                  width="7"
                  height="8"
                  viewBox="0 0 7 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[5px] h-1.5 absolute left-2.5 top-[9px] "
                >
                  <path
                    d="M5.48836 0.530029H0.530029V6.90503H5.48836V0.530029Z"
                    stroke="#F0DCAE"
                    strokeWidth="1.06"
                  />
                </svg>
                <svg
                  width="7"
                  height="5"
                  viewBox="0 0 7 5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[5px] h-1 absolute left-0.5 top-[11px] "
                >
                  <path
                    d="M5.48836 0.530029H0.530029V4.0717H5.48836V0.530029Z"
                    stroke="#F0DCAE"
                    strokeWidth="1.06"
                  />
                </svg>
              </div>
              <p className="text-[#F0DCAE] font-jost text-sm w-fit">
                Dashboard
              </p>
            </div>
            <div className="flex py-0 px-5 items-center gap-3 w-full h-[46px]">
              <div className="w-[17px] h-[17px] overflow-hidden relative">
                <svg
                  width="13"
                  height="11"
                  viewBox="0 0 13 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[11px] h-[9px] absolute left-[3px] top-[5px] "
                >
                  <path
                    d="M0.590088 0.530029H11.9223L10.9307 9.73723H1.58166L0.590088 0.530029Z"
                    stroke="#9C8B69"
                    strokeWidth="1.06"
                  />
                </svg>
                <svg
                  width="7"
                  height="5"
                  viewBox="0 0 7 5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[5px] h-1 absolute left-1.5 top-px "
                >
                  <path
                    d="M0.530029 4.07283V3.00999C0.530029 2.35226 0.791167 1.72148 1.25599 1.25639C1.72082 0.79131 2.35126 0.530029 3.00863 0.530029C3.66599 0.530029 4.29644 0.79131 4.76126 1.25639C5.22609 1.72148 5.48723 2.35226 5.48723 3.00999V4.07283"
                    stroke="#9C8B69"
                    strokeWidth="1.06"
                  />
                </svg>
              </div>
              <p className="text-[#9C8B69] font-jost text-sm w-fit">Products</p>
            </div>
            <div className="flex py-0 px-5 items-center gap-3 w-full h-[46px]">
              <svg
                width="17"
                height="17"
                viewBox="0 0 17 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[17px] h-[17px] overflow-hidden relative "
              >
                <path
                  d="M2.83392 4.25H14.1661M2.83392 8.5H14.1661M2.83392 12.75H9.91655"
                  stroke="#9C8B69"
                  strokeWidth="1.06"
                />
              </svg>
              <p className="text-[#9C8B69] font-jost text-sm w-fit">
                Categories
              </p>
            </div>
            <div className="flex py-0 px-5 items-center gap-3 w-full h-[46px]">
              <div className="w-[17px] h-[17px] overflow-hidden relative">
                <svg
                  width="14"
                  height="12"
                  viewBox="0 0 14 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[13px] h-[11px] absolute left-0.5 top-1 "
                >
                  <path
                    d="M11.8634 0.530029H1.9467C1.16429 0.530029 0.530029 1.16429 0.530029 1.9467V9.73836C0.530029 10.5208 1.16429 11.155 1.9467 11.155H11.8634C12.6458 11.155 13.28 10.5208 13.28 9.73836V1.9467C13.28 1.16429 12.6458 0.530029 11.8634 0.530029Z"
                    stroke="#9C8B69"
                    strokeWidth="1.06"
                  />
                </svg>
                <svg
                  width="13"
                  height="2"
                  viewBox="0 0 13 2"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[13px] absolute left-0.5 top-[7px] "
                >
                  <path
                    d="M0 0.530029H12.75"
                    stroke="#9C8B69"
                    strokeWidth="1.06"
                  />
                </svg>
              </div>
              <p className="text-[#9C8B69] font-jost text-sm w-fit">Orders</p>
            </div>
            <div className="flex py-0 px-5 items-center gap-3 w-full h-[46px]">
              <div className="w-[17px] h-[17px] overflow-hidden relative">
                <svg
                  width="7"
                  height="7"
                  viewBox="0 0 7 7"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-1.5 h-1.5 absolute left-1.5 top-[3px] "
                >
                  <path
                    d="M3.36393 6.19613C4.92905 6.19613 6.19783 4.92773 6.19783 3.36308C6.19783 1.79843 4.92905 0.530029 3.36393 0.530029C1.79881 0.530029 0.530029 1.79843 0.530029 3.36308C0.530029 4.92773 1.79881 6.19613 3.36393 6.19613Z"
                    stroke="#9C8B69"
                    strokeWidth="1.06"
                  />
                </svg>
                <svg
                  width="13"
                  height="5"
                  viewBox="0 0 13 5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[11px] h-1 absolute left-[3px] top-[11px] "
                >
                  <path
                    d="M0.530029 4.78003C0.530029 1.9467 3.07977 0.530029 6.19613 0.530029C9.31248 0.530029 11.8622 1.9467 11.8622 4.78003"
                    stroke="#9C8B69"
                    strokeWidth="1.06"
                  />
                </svg>
              </div>
              <p className="text-[#9C8B69] font-jost text-sm w-fit">
                Customers
              </p>
            </div>
          </div>
        </div>
        <div className="flex p-4 flex-col items-start gap-3 rounded-2xl border border-[#453E37] bg-[#332E29] w-full">
          <p className="text-[#A79263] font-jost text-[11px] font-medium w-fit tracking-[0.12em]">
            System status
          </p>
          <div className="flex justify-between items-center w-full">
            <p className="text-[#D9BC7E] font-jost text-[13px] w-fit">Live</p>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex flex-col justify-center items-center rounded-xl bg-[#2E3A30] w-6 h-6 "
            >
              <rect width="24" height="24" rx="12" fill="#2E3A30" />
              <circle cx="12" cy="12" r="4" fill="#8FBF98" />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start shrink-0 bg-[#2A2623] w-[896px] h-[1507px]">
        <div className="flex py-0 px-10 justify-between items-center shrink-0 border-b border-b-[#453E37] bg-[#332E29] w-full h-[79px]">
          <div className="flex items-center gap-6 w-fit">
            <p className="text-[#D9BC7E] font-jost text-[15px] w-fit">
              Dashboard
            </p>
            <div className="flex flex-col items-start bg-[#453E37] w-px h-5"></div>
            <div className="flex items-center gap-3 w-fit">
              <button className="cursor-pointer text-nowrap flex flex-col justify-center items-center rounded-[18px] bg-[#3A342B] w-[34px] h-[34px]">
                <p className="text-[#E0B25C] font-jost text-[13px] w-fit">SA</p>
              </button>
              <p className="text-[#A79263] font-jost text-sm w-fit">
                Site Administrator
              </p>
            </div>
          </div>
          <div className="flex py-0 px-4 items-center gap-2.5 rounded-[14px] border border-[#453E37] bg-[#3A332B] w-80 h-11">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0 w-4 h-4 overflow-hidden relative "
            >
              <path
                d="M14.0001 14.0001L11.1068 11.1068M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z"
                stroke="#A79263"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-[#A79263] font-jost text-[13px] w-full">
              Search orders, products, customers
            </p>
          </div>
        </div>
        <div className="flex p-10 flex-col items-start gap-6 w-full h-full">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col items-start gap-2 w-fit">
              <p className="text-[#D9BC7E] font-cormorantGaramond text-[38px] w-fit">
                Overview
              </p>
              <p className="text-[#A79263] font-jost text-sm w-fit">
                Monitor fulfillment, revenue, and low-stock fragrances from one
                place.
              </p>
            </div>
            <div className="flex items-center gap-3 w-fit">
              <div className="flex flex-col justify-center items-center rounded-[14px] border border-[#453E37] bg-[#3A332B] w-11 h-11">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0 w-[18px] h-[18px] overflow-hidden relative "
                >
                  <path
                    d="M7.70006 15.7506C7.83172 15.9786 8.02108 16.168 8.24911 16.2996C8.47713 16.4313 8.73579 16.5006 8.99909 16.5006C9.26239 16.5006 9.52105 16.4313 9.74907 16.2996C9.9771 16.168 10.1665 15.9786 10.2981 15.7506M2.44596 11.4947C2.34798 11.6021 2.28332 11.7357 2.25984 11.8792C2.23637 12.0226 2.25509 12.1698 2.31373 12.3029C2.37237 12.4359 2.46841 12.549 2.59015 12.6284C2.71189 12.7079 2.8541 12.7502 2.99947 12.7503H14.9997C15.1451 12.7504 15.2873 12.7082 15.4091 12.6289C15.5309 12.5496 15.6271 12.4366 15.6859 12.3037C15.7447 12.1707 15.7636 12.0236 15.7403 11.8801C15.717 11.7366 15.6525 11.603 15.5547 11.4955C14.5572 10.4671 13.4997 9.3743 13.4997 5.99977C13.4997 4.80619 13.0256 3.66151 12.1816 2.81752C11.3377 1.97354 10.1931 1.49939 8.99959 1.49939C7.80609 1.49939 6.66148 1.97354 5.81755 2.81752C4.97361 3.66151 4.4995 4.80619 4.4995 5.99977C4.4995 9.3743 3.44123 10.4671 2.44596 11.4947Z"
                    stroke="#D9BC7E"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="flex py-0 px-[18px] items-center gap-2 rounded-[14px] bg-[#C9973F] w-fit h-11">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 overflow-hidden relative "
                >
                  <path
                    d="M3.33276 7.99996H12.6672M7.99996 3.33276V12.6672"
                    stroke="#241F1A"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-[#241F1A] font-jost text-[13px] font-semibold w-fit tracking-[0.1108em]">
                  + New product
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center gap-4 w-full">
            <div className="flex p-5 flex-col items-start gap-4 rounded-[18px] border border-[#453E37] bg-[#332E29] w-full h-[156px]">
              <div className="flex justify-between items-center w-full">
                <p className="text-[#A79263] font-jost text-[11px] font-medium w-full tracking-[0.16em]">
                  Orders awaiting action
                </p>
                <div className="flex flex-col justify-center items-center rounded-[14px] bg-[#3A332B] w-7 h-7">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0 w-3.5 h-3.5 overflow-hidden relative "
                  >
                    <g clipPath="url(#clip0_10_209)">
                      <path
                        d="M7.00006 3.49978V7.00006L9.33358 8.16682M12.8339 7.00006C12.8339 10.222 10.222 12.8339 7.00006 12.8339C3.77814 12.8339 1.16626 10.222 1.16626 7.00006C1.16626 3.77814 3.77814 1.16626 7.00006 1.16626C10.222 1.16626 12.8339 3.77814 12.8339 7.00006Z"
                        stroke="#D9BC7E"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_10_209">
                        <rect width="14" height="14" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>
              <p className="text-[#D9BC7E] font-cormorantGaramond text-[42px] leading-[42px] w-fit">
                2
              </p>
              <p className="text-[#A79263] font-jost text-[13px] w-full">
                1 pending · 1 shipping
              </p>
            </div>
            <div className="flex p-5 flex-col items-start gap-4 rounded-[18px] border border-[#453E37] bg-[#332E29] w-full h-[156px]">
              <div className="flex justify-between items-center w-full">
                <p className="text-[#A79263] font-jost text-[11px] font-medium w-fit tracking-[0.16em]">
                  Revenue this month
                </p>
                <div className="flex flex-col justify-center items-center rounded-[14px] bg-[#3A332B] w-7 h-7">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0 w-3.5 h-3.5 overflow-hidden relative "
                  >
                    <g clipPath="url(#clip0_10_215)">
                      <path
                        d="M12.25 9.33333V11.6667C12.25 11.8214 12.1885 11.9697 12.0791 12.0791C11.9697 12.1885 11.8214 12.25 11.6667 12.25H2.91667C2.60725 12.25 2.3105 12.1271 2.09171 11.9083C1.87292 11.6895 1.75 11.3928 1.75 11.0833V2.91667C1.75 2.60725 1.87292 2.3105 2.09171 2.09171C2.3105 1.87292 2.60725 1.75 2.91667 1.75H10.5C10.6547 1.75 10.8031 1.81146 10.9125 1.92085C11.0219 2.03025 11.0833 2.17862 11.0833 2.33333V4.08333M1.75 2.91667C1.75 3.22609 1.87292 3.52283 2.09171 3.74162C2.3105 3.96042 2.60725 4.08333 2.91667 4.08333H11.6667C11.8214 4.08333 11.9697 4.14479 12.0791 4.25419C12.1885 4.36358 12.25 4.51196 12.25 4.66667V7M12.25 7H10.5C10.1906 7 9.89383 7.12292 9.67504 7.34171C9.45625 7.5605 9.33333 7.85725 9.33333 8.16667C9.33333 8.47609 9.45625 8.77283 9.67504 8.99162C9.89383 9.21042 10.1906 9.33333 10.5 9.33333H12.25M12.25 7C12.4047 7 12.5531 7.06146 12.6625 7.17085C12.7719 7.28025 12.8333 7.42862 12.8333 7.58333V8.75C12.8333 8.90471 12.7719 9.05308 12.6625 9.16248C12.5531 9.27187 12.4047 9.33333 12.25 9.33333"
                        stroke="#D9BC7E"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_10_215">
                        <rect width="14" height="14" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>
              <p className="text-[#D9BC7E] font-cormorantGaramond text-[42px] leading-[42px] w-fit">
                R3 035
              </p>
              <p className="text-[#A79263] font-jost text-[13px] w-full">
                Across 3 paid orders
              </p>
            </div>
            <div className="flex p-5 flex-col items-start gap-4 rounded-[18px] border border-[#453E37] bg-[#332E29] w-full h-[156px]">
              <div className="flex justify-between items-center w-full">
                <p className="text-[#A79263] font-jost text-[11px] font-medium w-fit tracking-[0.16em]">
                  Active customers
                </p>
                <div className="flex flex-col justify-center items-center rounded-[14px] bg-[#3A332B] w-7 h-7">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0 w-3.5 h-3.5 overflow-hidden relative "
                  >
                    <g clipPath="url(#clip0_12_8)">
                      <path
                        d="M7.00006 3.49978V7.00006L9.33358 8.16682M12.8339 7.00006C12.8339 10.222 10.222 12.8339 7.00006 12.8339C3.77814 12.8339 1.16626 10.222 1.16626 7.00006C1.16626 3.77814 3.77814 1.16626 7.00006 1.16626C10.222 1.16626 12.8339 3.77814 12.8339 7.00006Z"
                        stroke="#D9BC7E"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_12_8">
                        <rect width="14" height="14" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>
              <p className="text-[#D9BC7E] font-cormorantGaramond text-[42px] leading-[42px] w-fit">
                12
              </p>
              <p className="text-[#A79263] font-jost text-[13px] w-full">
                3 placed orders today
              </p>
            </div>
            <div className="flex p-5 flex-col items-start gap-4 rounded-[18px] border border-[#C9973F] bg-[#332E29] w-full h-[156px]">
              <div className="flex justify-between items-center w-full">
                <p className="text-[#E0B25C] font-jost text-[11px] font-medium w-fit tracking-[0.16em]">
                  Low stock
                </p>
                <div className="flex flex-col justify-center items-center rounded-[14px] bg-[#3A332B] w-7 h-7">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0 w-3.5 h-3.5 overflow-hidden relative "
                  >
                    <g clipPath="url(#clip0_10_221)">
                      <path
                        d="M7.00006 4.66654V7.00006M7.00006 9.33358H7.00589M12.8339 7.00006C12.8339 10.222 10.222 12.8339 7.00006 12.8339C3.77814 12.8339 1.16626 10.222 1.16626 7.00006C1.16626 3.77814 3.77814 1.16626 7.00006 1.16626C10.222 1.16626 12.8339 3.77814 12.8339 7.00006Z"
                        stroke="#E0B25C"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_10_221">
                        <rect width="14" height="14" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>
              <p className="text-[#D9BC7E] font-cormorantGaramond text-[42px] leading-[42px] w-fit">
                1
              </p>
              <p className="text-[#A79263] font-jost text-[13px] w-full">
                Nabatieh - 8 left
              </p>
            </div>
          </div>
          <div className="flex p-6 flex-col items-start gap-4 rounded-[20px] border border-[#453E37] bg-[#332E29] w-full">
            <div className="flex justify-between items-center w-full">
              <p className="text-[#D9BC7E] font-cormorantGaramond text-2xl w-fit">
                Products
              </p>
              <p className="text-[#C9973F] font-jost text-[13px] w-fit">
                Manage all →
              </p>
            </div>
            <div className="flex py-3 px-4 items-center gap-4 rounded-[14px] bg-[#3A332B] w-full">
              <p className="text-[#A79263] font-jost text-[11px] font-medium w-full tracking-[0.14em]">
                Product
              </p>
              <p className="text-[#A79263] font-jost text-[11px] font-medium w-40 tracking-[0.14em]">
                Category
              </p>
              <p className="text-[#A79263] font-jost text-[11px] font-medium w-[120px] tracking-[0.14em]">
                Price
              </p>
              <p className="text-[#A79263] font-jost text-[11px] font-medium w-[100px] tracking-[0.14em]">
                Stock
              </p>
              <p className="text-[#A79263] font-jost text-[11px] font-medium w-[120px] tracking-[0.14em]">
                Actions
              </p>
            </div>
            <div className="flex flex-col items-start w-full">
              <div className="flex py-3.5 px-4 items-center gap-4 border-b border-b-[#453E37] w-full">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex flex-col justify-center items-center rounded-xl bg-[#3A3128] w-11 h-[52px]">
                    <div className="shrink-0 w-[22px] h-[30px] overflow-hidden relative">
                      <svg
                        width="5"
                        height="5"
                        viewBox="0 0 5 5"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-1 h-1 absolute left-[9px] top-0.5 "
                      >
                        <path
                          d="M3.85 0H0.55C0.246243 0 0 0.246243 0 0.55V3.85C0 4.15376 0.246243 4.4 0.55 4.4H3.85C4.15376 4.4 4.4 4.15376 4.4 3.85V0.55C4.4 0.246243 4.15376 0 3.85 0Z"
                          fill="#C9973F"
                        />
                      </svg>
                      <svg
                        width="13"
                        height="19"
                        viewBox="0 0 13 19"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-[18px] absolute left-[5px] top-[9px] "
                      >
                        <path
                          d="M11.6403 0.0916748H1.00823C0.502032 0.0916748 0.0916748 0.502073 0.0916748 1.00832V17.508C0.0916748 18.0143 0.502032 18.4247 1.00823 18.4247H11.6403C12.1465 18.4247 12.5569 18.0143 12.5569 17.508V1.00832C12.5569 0.502073 12.1465 0.0916748 11.6403 0.0916748Z"
                          fill="#FBF8F3"
                          stroke="#D8CCB8"
                          strokeWidth="0.1833"
                        />
                      </svg>
                      <svg
                        width="13"
                        height="10"
                        viewBox="0 0 13 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="opacity-60 w-3 h-[9px] absolute left-[5px] top-[18px] "
                      >
                        <path
                          opacity="0.6"
                          d="M0 0H12.4652V8.2485C12.4652 8.49157 12.3686 8.72469 12.1967 8.89656C12.0249 9.06844 11.7917 9.165 11.5486 9.165H0.916559C0.673472 9.165 0.440342 9.06844 0.268454 8.89656C0.0965657 8.72469 0 8.49157 0 8.2485V0Z"
                          fill="#D8B45A"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#D9BC7E] font-jost text-sm w-full">
                    French Avenue Nabatieh EDP 90ml
                  </p>
                </div>
                <p className="text-[#D9BC7E] font-jost text-sm w-40">For Him</p>
                <p className="text-[#D9BC7E] font-jost text-sm w-[120px]">
                  R829.00
                </p>
                <div className="flex items-center w-[100px]">
                  <div className="flex py-1.5 px-3 items-start rounded-[999px] bg-[#3E362A] w-fit">
                    <p className="text-[#E0B25C] font-jost text-[11px] font-medium w-fit tracking-[0.12em]">
                      8 low
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-[120px]">
                  <p className="text-[#C9973F] font-jost text-[13px] w-fit">
                    Edit
                  </p>
                  <p className="text-[#A3453B] font-jost text-[13px] w-fit">
                    Delete
                  </p>
                </div>
              </div>
              <div className="flex py-3.5 px-4 items-center gap-4 border-b border-b-[#453E37] w-full">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex flex-col justify-center items-center rounded-xl bg-[#38302A] w-11 h-[52px]">
                    <div className="shrink-0 w-[22px] h-[30px] overflow-hidden relative">
                      <svg
                        width="5"
                        height="5"
                        viewBox="0 0 5 5"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-1 h-1 absolute left-[9px] top-0.5 "
                      >
                        <path
                          d="M3.85 0H0.55C0.246243 0 0 0.246243 0 0.55V3.85C0 4.15376 0.246243 4.4 0.55 4.4H3.85C4.15376 4.4 4.4 4.15376 4.4 3.85V0.55C4.4 0.246243 4.15376 0 3.85 0Z"
                          fill="#C9973F"
                        />
                      </svg>
                      <svg
                        width="13"
                        height="19"
                        viewBox="0 0 13 19"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-[18px] absolute left-[5px] top-[9px] "
                      >
                        <path
                          d="M11.6403 0.0916748H1.00823C0.502032 0.0916748 0.0916748 0.502073 0.0916748 1.00832V17.508C0.0916748 18.0143 0.502032 18.4247 1.00823 18.4247H11.6403C12.1465 18.4247 12.5569 18.0143 12.5569 17.508V1.00832C12.5569 0.502073 12.1465 0.0916748 11.6403 0.0916748Z"
                          fill="#FBF8F3"
                          stroke="#D8CCB8"
                          strokeWidth="0.1833"
                        />
                      </svg>
                      <svg
                        width="13"
                        height="10"
                        viewBox="0 0 13 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="opacity-[55%] w-3 h-[9px] absolute left-[5px] top-[18px] "
                      >
                        <path
                          opacity="0.55"
                          d="M0 0H12.4652V8.2485C12.4652 8.49157 12.3686 8.72469 12.1967 8.89656C12.0249 9.06844 11.7917 9.165 11.5486 9.165H0.916559C0.673472 9.165 0.440342 9.06844 0.268454 8.89656C0.0965657 8.72469 0 8.49157 0 8.2485V0Z"
                          fill="#B07A4A"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#D9BC7E] font-jost text-sm w-full">
                    Lattafa Masa gift set EDP 100ml
                  </p>
                </div>
                <p className="text-[#D9BC7E] font-jost text-sm w-40">For Her</p>
                <p className="text-[#D9BC7E] font-jost text-sm w-[120px]">
                  R779.00
                </p>
                <div className="flex items-center w-[100px]">
                  <div className="flex py-1.5 px-3 items-start rounded-[999px] bg-[#2E3A30] w-fit">
                    <p className="text-[#8FBF98] font-jost text-[11px] font-medium w-fit tracking-[0.12em]">
                      9
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-[120px]">
                  <p className="text-[#C9973F] font-jost text-[13px] w-fit">
                    Edit
                  </p>
                  <p className="text-[#A3453B] font-jost text-[13px] w-fit">
                    Delete
                  </p>
                </div>
              </div>
              <div className="flex py-3.5 px-4 items-center gap-4 border-b border-b-[#453E37] w-full">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex flex-col justify-center items-center rounded-xl bg-[#313529] w-11 h-[52px]">
                    <div className="shrink-0 w-[22px] h-[30px] overflow-hidden relative">
                      <svg
                        width="5"
                        height="5"
                        viewBox="0 0 5 5"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-1 h-1 absolute left-[9px] top-0.5 "
                      >
                        <path
                          d="M3.85 0H0.55C0.246243 0 0 0.246243 0 0.55V3.85C0 4.15376 0.246243 4.4 0.55 4.4H3.85C4.15376 4.4 4.4 4.15376 4.4 3.85V0.55C4.4 0.246243 4.15376 0 3.85 0Z"
                          fill="#C9973F"
                        />
                      </svg>
                      <svg
                        width="13"
                        height="19"
                        viewBox="0 0 13 19"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-[18px] absolute left-[5px] top-[9px] "
                      >
                        <path
                          d="M11.6403 0.0916748H1.00823C0.502032 0.0916748 0.0916748 0.502073 0.0916748 1.00832V17.508C0.0916748 18.0143 0.502032 18.4247 1.00823 18.4247H11.6403C12.1465 18.4247 12.5569 18.0143 12.5569 17.508V1.00832C12.5569 0.502073 12.1465 0.0916748 11.6403 0.0916748Z"
                          fill="#FBF8F3"
                          stroke="#D8CCB8"
                          strokeWidth="0.1833"
                        />
                      </svg>
                      <svg
                        width="13"
                        height="10"
                        viewBox="0 0 13 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="opacity-50 w-3 h-[9px] absolute left-[5px] top-[18px] "
                      >
                        <path
                          opacity="0.5"
                          d="M0 0H12.4652V8.2485C12.4652 8.49157 12.3686 8.72469 12.1967 8.89656C12.0249 9.06844 11.7917 9.165 11.5486 9.165H0.916559C0.673472 9.165 0.440342 9.06844 0.268454 8.89656C0.0965657 8.72469 0 8.49157 0 8.2485V0Z"
                          fill="#7E8C6A"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#D9BC7E] font-jost text-sm w-full">
                    Al Wataniah Keyaan Classic EDP 100ml
                  </p>
                </div>
                <p className="text-[#D9BC7E] font-jost text-sm w-40">For Him</p>
                <p className="text-[#D9BC7E] font-jost text-sm w-[120px]">
                  R549.00
                </p>
                <div className="flex items-center w-[100px]">
                  <div className="flex py-1.5 px-3 items-start rounded-[999px] bg-[#2E3A30] w-fit">
                    <p className="text-[#8FBF98] font-jost text-[11px] font-medium w-fit tracking-[0.12em]">
                      17
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-[120px]">
                  <p className="text-[#C9973F] font-jost text-[13px] w-fit">
                    Edit
                  </p>
                  <p className="text-[#A3453B] font-jost text-[13px] w-fit">
                    Delete
                  </p>
                </div>
              </div>
              <div className="flex py-3.5 px-4 items-center gap-4 w-full">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex flex-col justify-center items-center rounded-xl bg-[#3A2F30] w-11 h-[52px]">
                    <div className="shrink-0 w-[22px] h-[30px] overflow-hidden relative">
                      <svg
                        width="5"
                        height="5"
                        viewBox="0 0 5 5"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-1 h-1 absolute left-[9px] top-0.5 "
                      >
                        <path
                          d="M3.85 0H0.55C0.246243 0 0 0.246243 0 0.55V3.85C0 4.15376 0.246243 4.4 0.55 4.4H3.85C4.15376 4.4 4.4 4.15376 4.4 3.85V0.55C4.4 0.246243 4.15376 0 3.85 0Z"
                          fill="#C9973F"
                        />
                      </svg>
                      <svg
                        width="13"
                        height="19"
                        viewBox="0 0 13 19"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-[18px] absolute left-[5px] top-[9px] "
                      >
                        <path
                          d="M11.6403 0.0916748H1.00823C0.502032 0.0916748 0.0916748 0.502073 0.0916748 1.00832V17.508C0.0916748 18.0143 0.502032 18.4247 1.00823 18.4247H11.6403C12.1465 18.4247 12.5569 18.0143 12.5569 17.508V1.00832C12.5569 0.502073 12.1465 0.0916748 11.6403 0.0916748Z"
                          fill="#FBF8F3"
                          stroke="#D8CCB8"
                          strokeWidth="0.1833"
                        />
                      </svg>
                      <svg
                        width="13"
                        height="10"
                        viewBox="0 0 13 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="opacity-[55%] w-3 h-[9px] absolute left-[5px] top-[18px] "
                      >
                        <path
                          opacity="0.55"
                          d="M0 0H12.4652V8.2485C12.4652 8.49157 12.3686 8.72469 12.1967 8.89656C12.0249 9.06844 11.7917 9.165 11.5486 9.165H0.916559C0.673472 9.165 0.440342 9.06844 0.268454 8.89656C0.0965657 8.72469 0 8.49157 0 8.2485V0Z"
                          fill="#D9A0A8"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[#D9BC7E] font-jost text-sm w-full">
                    Ard Al Zaafaran Yara EDP 50ml
                  </p>
                </div>
                <p className="text-[#D9BC7E] font-jost text-sm w-40">For Her</p>
                <p className="text-[#D9BC7E] font-jost text-sm w-[120px]">
                  R439.00
                </p>
                <div className="flex items-center w-[100px]">
                  <div className="flex py-1.5 px-3 items-start rounded-[999px] bg-[#2E3A30] w-fit">
                    <p className="text-[#8FBF98] font-jost text-[11px] font-medium w-fit tracking-[0.12em]">
                      19
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-[120px]">
                  <p className="text-[#C9973F] font-jost text-[13px] w-fit">
                    Edit
                  </p>
                  <p className="text-[#A3453B] font-jost text-[13px] w-fit">
                    Delete
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex p-6 flex-col items-start gap-4 rounded-[20px] border border-[#453E37] bg-[#332E29] w-full">
            <div className="flex justify-between items-center w-full">
              <p className="text-[#D9BC7E] font-cormorantGaramond text-2xl w-fit">
                Recent orders
              </p>
              <p className="text-[#C9973F] font-jost text-[13px] w-fit">
                All orders →
              </p>
            </div>
            <div className="flex py-3 px-4 items-center gap-4 rounded-[14px] bg-[#3A332B] w-full">
              <p className="text-[#A79263] font-jost text-[11px] font-medium w-[140px] tracking-[0.14em]">
                Order
              </p>
              <p className="text-[#A79263] font-jost text-[11px] font-medium w-[180px] tracking-[0.14em]">
                Customer
              </p>
              <p className="text-[#A79263] font-jost text-[11px] font-medium w-[120px] tracking-[0.14em]">
                Total
              </p>
              <p className="text-[#A79263] font-jost text-[11px] font-medium w-[110px] tracking-[0.14em]">
                Payment
              </p>
              <p className="text-[#A79263] font-jost text-[11px] font-medium w-full tracking-[0.14em]">
                Status
              </p>
            </div>
            <div className="flex flex-col items-start w-full">
              <div className="flex py-3.5 px-4 items-center gap-4 border-b border-b-[#453E37] w-full">
                <p className="text-[#D9BC7E] font-jost text-sm w-[140px]">
                  SCT-2026-0148
                </p>
                <p className="text-[#D9BC7E] font-jost text-sm w-[180px]">
                  Hanré Koen
                </p>
                <p className="text-[#D9BC7E] font-jost text-sm w-[120px]">
                  R1 707.00
                </p>
                <div className="flex items-center w-[110px]">
                  <div className="flex py-1.5 px-3 items-start rounded-[999px] bg-[#2E3A30] w-fit">
                    <p className="text-[#8FBF98] font-jost text-[11px] font-medium w-fit tracking-[0.12em]">
                      Paid
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <div className="flex py-2 px-3 items-start rounded-[999px] border border-[#564C3A] bg-[#3A332B] w-fit">
                    <p className="text-[#D9BC7E] font-jost text-[13px] w-fit">
                      Pending
                    </p>
                  </div>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 overflow-hidden relative "
                  >
                    <path
                      d="M4.5 9L7.5 6L4.5 3"
                      stroke="#A79263"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex py-3.5 px-4 items-center gap-4 border-b border-b-[#453E37] w-full">
                <p className="text-[#D9BC7E] font-jost text-sm w-[140px]">
                  SCT-2026-0131
                </p>
                <p className="text-[#D9BC7E] font-jost text-sm w-[180px]">
                  M. Combrink
                </p>
                <p className="text-[#D9BC7E] font-jost text-sm w-[120px]">
                  R779.00
                </p>
                <div className="flex items-center w-[110px]">
                  <div className="flex py-1.5 px-3 items-start rounded-[999px] bg-[#2E3A30] w-fit">
                    <p className="text-[#8FBF98] font-jost text-[11px] font-medium w-fit tracking-[0.12em]">
                      Paid
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <div className="flex py-2 px-3 items-start rounded-[999px] border border-[#564C3A] bg-[#3A332B] w-fit">
                    <p className="text-[#D9BC7E] font-jost text-[13px] w-fit">
                      Shipping
                    </p>
                  </div>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 overflow-hidden relative "
                  >
                    <path
                      d="M4.5 9L7.5 6L4.5 3"
                      stroke="#A79263"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex py-3.5 px-4 items-center gap-4 w-full">
                <p className="text-[#D9BC7E] font-jost text-sm w-[140px]">
                  SCT-2026-0094
                </p>
                <p className="text-[#D9BC7E] font-jost text-sm w-[180px]">
                  T. Tyini
                </p>
                <p className="text-[#D9BC7E] font-jost text-sm w-[120px]">
                  R549.00
                </p>
                <div className="flex items-center w-[110px]">
                  <div className="flex py-1.5 px-3 items-start rounded-[999px] bg-[#2E3A30] w-fit">
                    <p className="text-[#8FBF98] font-jost text-[11px] font-medium w-fit tracking-[0.12em]">
                      Paid
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <div className="flex py-2 px-3 items-start rounded-[999px] border border-[#564C3A] bg-[#3A332B] w-fit">
                    <p className="text-[#D9BC7E] font-jost text-[13px] w-fit">
                      Delivered
                    </p>
                  </div>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3 overflow-hidden relative "
                  >
                    <path
                      d="M4.5 9L7.5 6L4.5 3"
                      stroke="#A79263"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}