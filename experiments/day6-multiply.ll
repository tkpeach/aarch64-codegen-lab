define i64 @product_sum(i64 %x, i64 %y, i64 %a) {
  %p = mul i64 %x, %y
  %r = add i64 %p, %a
  ret i64 %r
}

define i64 @product_xor(i64 %x, i64 %y, i64 %a) {
  %p = mul i64 %x, %y
  %r = xor i64 %p, %a
  ret i64 %r
}
