create table public.orders (
  id bigint generated always as identity not null,
  customer_id bigint null,
  order_number text null,
  subtotal numeric(12, 2) not null,
  shipping_fee numeric(12, 2) null default 0,
  total numeric(12, 2) not null,
  status text null default 'pending'::text,
  shipping_address text null,
  payment_method text null,
  notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  payment_status public.payment_status not null default 'unpaid'::payment_status,
  constraint orders_pkey primary key (id),
  constraint orders_order_number_key unique (order_number),
  constraint orders_customer_id_fkey foreign KEY (customer_id) references customers (id) on delete set null,
  constraint orders_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'processing'::text,
          'shipped'::text,
          'delivered'::text,
          'cancelled'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create trigger trg_set_order_number
after INSERT on orders for EACH row when (new.order_number is null)
execute FUNCTION set_order_number ();


create table public.order_items (
  id bigint generated always as identity not null,
  order_id bigint null,
  product_id bigint null,
  product_name text not null,
  quantity integer not null,
  price numeric(12, 2) not null,
  total numeric(12, 2) not null,
  constraint order_items_pkey primary key (id),
  constraint order_items_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint order_items_product_id_fkey foreign KEY (product_id) references products (id) on delete set null
) TABLESPACE pg_default;