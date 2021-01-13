CREATE TABLE public.bid_and_ask (
    id bigint NOT NULL,
    "productId" bigint,
    producttype character varying,
    amount double precision,
    isdeleted boolean NOT NULL,
    "createdAt" date,
    "createdbyId" bigint,
    "updatedAt" date,
    "updatedbyId" bigint,
    request character varying,
    type character varying,
    note character varying,
    "maxQuantity" character varying,
    "minQuantity" bigint,
    subtype bigint,
    isactive boolean,
    isaddtocart boolean,
    "isPrivate" boolean DEFAULT false NOT NULL
);


CREATE TABLE public.cart (
    id bigint NOT NULL,
    bidask_id bigint,
    user_id bigint,
    "isDeleted" boolean,
    "isCheckout" boolean,
    "createdAt" date,
    "updatedAt" date,
    "expireAt" date
);

CREATE TABLE public.cat_subcat_mapping (
    id integer NOT NULL,
    category_id integer NOT NULL,
    subcategory_id integer NOT NULL,
    status smallint NOT NULL,
    created_at date NOT NULL,
    updated_at date NOT NULL
);


CREATE TABLE public.category (
    id bigint NOT NULL,
    "categoryName" character varying,
    "createdAt" date,
    isdeleted boolean,
    "createdById" bigint,
    "updatedById" bigint,
    "updatedAt" date,
    category_id character varying NOT NULL,
    priority integer
);


CREATE TABLE public.chat_offer (
    id bigint NOT NULL,
    offer_id bigint,
    contact_id bigint,
    created_at date,
    updated_at date
);


CREATE TABLE public.chats (
    id bigint NOT NULL,
    my_id bigint NOT NULL,
    contact_id bigint NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp without time zone,
    room_id bigint NOT NULL,
    isdelete boolean,
    date_to_group timestamp without time zone,
    type character varying,
    message json,
    "isActionPerformedbySender" boolean,
    "isActionPerformedbyRecieved" boolean,
    "isofferAccepted" boolean,
    "isofferCanceled" boolean,
    "isofferExpired" boolean,
    "isOfferCancelled" boolean
);


CREATE TABLE public.cities (
    id bigint NOT NULL,
    states_id integer NOT NULL,
    city character varying NOT NULL,
    county character varying NOT NULL,
    latitude character varying NOT NULL,
    longitude character varying NOT NULL
);



CREATE TABLE public.contacts (
    id bigint NOT NULL,
    my_id bigint NOT NULL,
    my_contact_id bigint NOT NULL,
    isblocked boolean,
    created_at date,
    updated_at date,
    room_id bigint,
    offer_id bigint
);


CREATE TABLE public.counter_history (
    id integer NOT NULL,
    counter_created_at timestamp with time zone NOT NULL,
    counter_user_name character varying(255) NOT NULL,
    counter_qty integer NOT NULL,
    counter_amount integer,
    is_responder boolean DEFAULT false NOT NULL,
    counter_id integer NOT NULL,
    counter_user_id integer NOT NULL
);



CREATE TABLE public.counters (
    id bigint DEFAULT nextval('public.counters_id_seq'::regclass) NOT NULL,
    bid_and_ask_id bigint NOT NULL,
    seller_id bigint NOT NULL,
    bidder_id bigint NOT NULL,
    expiry_date timestamp without time zone NOT NULL,
    is_deleted boolean,
    type_of character varying NOT NULL,
    type_of_offer character varying NOT NULL,
    payment_time character varying,
    payment_method character varying,
    expiry_day bigint NOT NULL,
    product_id bigint NOT NULL,
    note character varying,
    qty bigint NOT NULL,
    amount double precision NOT NULL,
    total_amount double precision NOT NULL,
    created_at date NOT NULL,
    status character varying,
    track_no character varying,
    is_read boolean,
    type character varying,
    is_counter_sent boolean DEFAULT false NOT NULL,
    is_counter_received boolean DEFAULT false NOT NULL,
    shipment_date timestamp with time zone,
    payment_date timestamp with time zone,
    is_private boolean DEFAULT false NOT NULL,
    transaction_number character varying(6)
);



CREATE TABLE public.emailblast (
    id integer NOT NULL,
    subject character varying,
    message text,
    "createdAt" date,
    is_deleted boolean,
    "user" json[],
    "createdBy" bigint
);



CREATE TABLE public.feedbacks (
    id bigint NOT NULL,
    bid_and_ask_id bigint NOT NULL,
    counters_id bigint NOT NULL,
    feedback_by_seller smallint,
    updated_by bigint,
    created_at date DEFAULT now() NOT NULL,
    updated_at date DEFAULT now() NOT NULL,
    isdeleted boolean DEFAULT false NOT NULL,
    status boolean DEFAULT false NOT NULL,
    feedback_by_bidder smallint
);



CREATE TABLE public.images (
    id bigint NOT NULL,
    "productId" bigint,
    "createdById" bigint,
    "isDeleted" boolean,
    "imageId" character varying,
    "imageUrl" character varying,
    "createdAt" date,
    "updatedAt" date,
    "updatedById" bigint,
    "userId" bigint
);


CREATE TABLE public.knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);



CREATE TABLE public.knex_migrations_lock (
    is_locked integer
);


CREATE TABLE public.languages (
    id bigint DEFAULT nextval('public.languages_id_seq'::regclass) NOT NULL,
    language character varying NOT NULL
);


CREATE TABLE public.messages (
    id bigint NOT NULL,
    room_id bigint NOT NULL,
    body text NOT NULL,
    status boolean NOT NULL,
    created_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    sender_id integer,
    receiver_id integer,
    is_counter_offer boolean DEFAULT false,
    counter_id integer,
    is_new_offer boolean DEFAULT false
);


CREATE TABLE public.notifications (
    created_by bigint,
    content character varying(255),
    destnation_user_id bigint,
    is_deleted boolean DEFAULT false,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    id bigint NOT NULL
);


CREATE TABLE public.orders (
    id integer NOT NULL,
    counter_id bigint NOT NULL,
    product_id bigint NOT NULL,
    status character varying NOT NULL,
    created_at date,
    "createdbyId" bigint,
    is_deleted boolean,
    track_no character varying,
    courier character varying,
    paymentdetail character varying,
    delivered boolean,
    payment_date timestamp with time zone,
    shipment_date timestamp with time zone
);


CREATE TABLE public.practice (
    id integer NOT NULL,
    text character varying(255)
);


CREATE TABLE public.products (
    id bigint NOT NULL,
    "productName" character varying,
    "categoryId" bigint,
    isdeleted boolean,
    "createdById" bigint,
    "createdAt" date,
    "updatedById" bigint,
    "updatedAt" date,
    "releaseDate" date,
    product_id character varying,
    "isActivate" boolean,
    "subcategoryId" bigint,
    is_featured boolean
);


CREATE TABLE public.rooms (
    id bigint NOT NULL,
    created_at date,
    status boolean,
    updated_at date,
    room_base character varying(255),
    sender_id integer,
    receiver_id integer
);


CREATE TABLE public.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


CREATE TABLE public.settings (
    id bigint NOT NULL,
    is_subscription_enabled boolean,
    "createdAt" date,
    "updatedAt" date,
    isdeleted boolean,
    settingname character varying,
    settingvalue json
);


CREATE TABLE public.states (
    id integer DEFAULT nextval('public.states_id_seq'::regclass) NOT NULL,
    state_code character varying NOT NULL,
    state_name character varying NOT NULL
);



CREATE TABLE public.subcategory (
    id integer NOT NULL,
    subcategory_name integer,
    "createdAt" date,
    "updatedAt" date,
    isdeleted boolean,
    "createdById" bigint,
    "updatedById" bigint,
    subcategory_id character varying
);


CREATE TABLE public.subscriptions (
    id bigint NOT NULL,
    plan_name character varying NOT NULL,
    amount integer NOT NULL,
    tenure character varying,
    status smallint,
    is_recurring smallint,
    updated_at date,
    created_at date,
    isdeleted boolean NOT NULL
);


CREATE TABLE public.tblmax (
    "HighestBid" bigint,
    "productId" bigint
);


CREATE TABLE public.tblmin (
    "LowestAsk" bigint,
    "productId" bigint
);


CREATE TABLE public.tests (
    id integer NOT NULL,
    customer_name integer NOT NULL
);


CREATE TABLE public.transaction_details (
    id bigint DEFAULT nextval('public.transaction_details_id_seq'::regclass) NOT NULL,
    aco_id bigint NOT NULL,
    plaid_object character varying,
    dwolla_object character varying,
    dwolla_customer_url character varying,
    "dwolla_balance_fund_Source" character varying,
    dwolla_doc_verify_url character varying,
    dwolla_doc_verify_status character varying,
    linked_acc character varying NOT NULL
);


CREATE TABLE public.transaction_history (
    id integer NOT NULL,
    total_txn_lifetime bigint,
    "createdAt" date,
    is_deleted boolean,
    "userId" bigint,
    "updatedAt" date
);


CREATE TABLE public.users (
    id bigint NOT NULL,
    user_id character varying,
    first_name character varying,
    last_name character varying,
    email character varying,
    password character varying,
    expire_password_expire character varying,
    verifying_token character varying,
    phone_number bigint,
    address character varying,
    city character varying,
    state character varying,
    country character varying,
    zip_code character varying,
    profile_image_id character varying,
    created_at date,
    updated_at date,
    date_of_birth date,
    is_deleted boolean,
    is_active boolean,
    created_by_id bigint,
    billing_address character varying,
    shipping_address character varying,
    user_name character varying,
    profile_image_url character varying,
    acc_very_token character varying,
    term_shipping character varying,
    payment_mode character varying,
    payment_timing character varying,
    additional_term character varying,
    billingaddress1 character varying,
    billingaddress2 character varying,
    billingstate character varying,
    billingcity character varying,
    billingzipcode character varying,
    shippingaddress1 character varying,
    shippingaddress2 character varying,
    shippingstate character varying,
    shippingcity character varying,
    shippingzipcode character varying,
    companyname character varying,
    role character varying,
    company_name character varying(255),
    company_logo character varying(255),
    is_emailblast boolean
);

CREATE TABLE public.watchlists (
    id integer NOT NULL,
    user_id bigint NOT NULL,
    product_id bigint NOT NULL,
    status integer,
    created_at date,
    updated_at date
);
